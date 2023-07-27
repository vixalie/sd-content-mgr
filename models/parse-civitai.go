package models

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"archgrid.xyz/ag/toolsbox/serial_code/hail"
	"github.com/samber/lo"
	"github.com/shopspring/decimal"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// 这里解析的是从Civitai返回的Model Version响应信息，包括直接从Civitai Restful API接口获取到的JSON响应和Civitai Helper
// 保存的Civitai info文件内容。这个解析方法不能保证解析出完整的Model信息，只能解析Model的单一Model Version信息，所以在使用的时候，
// 需要先检索数据库中是否已经存在相应的Model记录和Model Version记录。
//
// 这个方法不会返回任何内容，智慧在出现错误的时候返回错误信息。所有成功的解析结果都会直接保存到数据库中。
func parseCivitaiModelVersionResponse(ctx context.Context, versionResponse []byte) error {
	var versionInfo *ModelVersion
	err := json.Unmarshal(versionResponse, versionInfo)
	if err != nil {
		return fmt.Errorf("civitai info文件解析失败，%w", err)
	}
	err = persistModelFromVersion(ctx, versionInfo)
	if err != nil {
		return fmt.Errorf("无法提取模型信息，%w", err)
	}
	err = persistModelVersion(ctx, versionInfo, versionResponse)
	return err
}

// 注意，这个方法生成的Model信息未残缺信息，因为其数据来源是Model Version中携带的反推信息。
func persistModelFromVersion(ctx context.Context, versionInfo *ModelVersion) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	// 首先从数据库中检索一下是否已经存在指定的模型，如果存在则直接返回。
	var model *entities.Model
	dbConn.Where("civitai_model_id = ?", versionInfo.ModelId).First(&entities.Model{}).First(model)
	if model == nil {
		model = &entities.Model{
			Id:               versionInfo.ModelId,
			Name:             versionInfo.Model.Name,
			NSFW:             lo.ToPtr(versionInfo.Model.NSFW),
			PersonOfInterest: lo.ToPtr(versionInfo.Model.POI),
			Type:             versionInfo.Model.Type,
		}
		// 如果在创建Model记录的事后发生了模型ID冲突，说明可能另一个协程已经创建了相同的模型记录，所以这里直接忽略冲突。
		// 但后面要用到的Model记录内容应该是相同的，所以不再重复获取。
		dbConn.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoNothing: true,
		}).Create(model)
	}
	return nil
}

// 提取并保存模型Version。同时分散启动对于模型文件和图片的提取和保存。
func persistModelVersion(ctx context.Context, versionInfo *ModelVersion, original []byte) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var err error
	files, err := persistModelFiles(ctx, versionInfo)
	if err != nil {
		return fmt.Errorf("无法提取模型文件信息，%w", err)
	}
	images, err := persistVersionImages(ctx, versionInfo)
	if err != nil {
		return fmt.Errorf("无法提取模型图片信息，%w", err)
	}
	// 这里开始提取和组装模型版本信息。
	var prompts = make([]string, 0)
	for _, word := range versionInfo.TrainedWords {
		for _, prompt := range strings.Split(word, ",") {
			prompts = append(prompts, strings.TrimSpace(prompt))
		}
	}
	var versionPrimaryFile *int64
	if primaryFile, found := lo.Find(files, func(file entities.ModelFile) bool {
		return file.Primary != nil && *file.Primary
	}); found {
		versionPrimaryFile = lo.ToPtr(primaryFile.Id)
	}
	var versionCover *string
	if len(images) > 0 {
		versionCover = lo.ToPtr(images[0].Id)
	}
	modelVersion := entities.ModelVersion{
		Id:                      versionInfo.Id,
		ModelId:                 lo.ToPtr(versionInfo.ModelId),
		VersionName:             versionInfo.Name,
		ActivatePrompt:          prompts,
		BaseModel:               versionInfo.BaseModel,
		PageUrl:                 lo.ToPtr(AssembleModelVersionUrl(versionInfo.Id)),
		DownloadUrl:             &versionInfo.DownloadUrl,
		PrimaryFileId:           versionPrimaryFile,
		CoverUsed:               versionCover,
		CivitaiOriginalResponse: original,
		CivitaiCreatedAt:        versionInfo.CreatedAt,
		CivitaiUpdatedAt:        versionInfo.UpdatedAt,
	}
	dbConn.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoNothing: true,
	}).Create(&modelVersion)
	return nil
}

func persistModelFiles(ctx context.Context, versionInfo *ModelVersion) ([]entities.ModelFile, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelFiles = make([]entities.ModelFile, 0)
	hailEngine, err := hail.Get()
	if err != nil {
		return nil, fmt.Errorf("无法获取Hail ID生成器，%w", err)
	}
	for _, file := range versionInfo.Files {
		fileRecord := entities.ModelFile{
			VersionId:    versionInfo.Id,
			Name:         lo.FromPtrOr[string](file.Name, ""),
			Size:         file.SizeKB.Mul(decimal.NewFromInt(1024)).BigInt().Uint64(),
			Type:         file.Type,
			IdentityHash: lo.FromPtrOr[string](file.Hashes.Sha256, ""),
			Metadata:     file.Metadata,
			Hashes:       file.Hashes,
			Primary:      file.Primary,
			DownloadUrl:  file.DownloadUrl,
		}
		if file.Id != nil {
			fileRecord.Id = int64(*file.Id)
		} else {
			fileRecord.Id = hailEngine.Generate()
		}
		modelFiles = append(modelFiles, fileRecord)
	}
	dbConn.CreateInBatches(modelFiles, 20)
	return modelFiles, nil
}

// 从civitai的响应中提取出ModelVersion携带的图片信息，但是不会下载图片，所有与实际本地图片有关的字段都将保持为空。
func persistVersionImages(ctx context.Context, versionInfo *ModelVersion) ([]entities.Image, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var images = make([]entities.Image, 0)
	hailEngine, err := hail.Get()
	if err != nil {
		return images, fmt.Errorf("无法获取Hail ID生成器，%w", err)
	}
	for _, image := range versionInfo.Images {
		imageId := hailEngine.GeneratePrefixedString("IM")
		meta, err := json.Marshal(image.Meta)
		if err != nil {
			return images, fmt.Errorf("无法序列化图片元数据，%w", err)
		}
		im := entities.Image{
			Id:          imageId,
			VersionId:   lo.ToPtr(versionInfo.Id),
			FileName:    "",
			BlurHash:    image.Hash,
			DownloadUrl: image.Url,
			Width:       lo.ToPtr(image.Width),
			Height:      lo.ToPtr(image.Height),
			NSFW:        lo.ToPtr(entities.ConvertNSFWLevel(image.NSFW)),
			Meta:        lo.ToPtr(image.Meta),
			RawMeta:     meta,
		}
		images = append(images, im)
	}
	dbConn.CreateInBatches(images, 20)
	return images, nil
}
