package models

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"archgrid.xyz/ag/toolsbox/serial_code/hail"
	"github.com/samber/lo"
	"github.com/shopspring/decimal"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// 这里解析的是从Civitai返回的Model Version响应信息，包括直接从Civitai Restful API接口获取到的JSON响应和Civitai Helper
// 保存的Civitai info文件内容。这个解析方法不能保证解析出完整的Model信息，只能解析Model的单一Model Version信息，所以在使用的时候，
// 需要先检索数据库中是否已经存在相应的Model记录和Model Version记录。
//
// 这个方法不会返回任何内容，智慧在出现错误的时候返回错误信息。所有成功的解析结果都会直接保存到数据库中。
func ParseCivitaiModelVersionResponse(ctx context.Context, versionResponse []byte) (*ModelVersion, error) {
	var versionInfo ModelVersion
	err := json.Unmarshal(versionResponse, &versionInfo)
	if err != nil {
		return nil, fmt.Errorf("civitai info文件解析失败，%w", err)
	}
	err = persistModelFromVersion(ctx, &versionInfo)
	if err != nil {
		return nil, fmt.Errorf("无法提取模型信息，%w", err)
	}
	err = persistModelVersion(ctx, &versionInfo, versionResponse)
	return &versionInfo, err
}

// 注意，这个方法生成的Model信息未残缺信息，因为其数据来源是Model Version中携带的反推信息。
func persistModelFromVersion(ctx context.Context, versionInfo *ModelVersion) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	// 首先从数据库中检索一下是否已经存在指定的模型，如果存在则直接返回。
	var model *entities.Model
	dbConn.Where("id = ?", versionInfo.ModelId).First(&entities.Model{}).First(model)
	if model == nil {
		runtime.EventsEmit(ctx, "cache-status", "not-cached")
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
	} else {
		runtime.EventsEmit(ctx, "cache-status", "cached")
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

// 提取并解析每个模型版本中所包含的文件信息。每个模型版本可能会包含模型文件本身与模型训练集文件，其中训练集文件只需要保持文件信息即可，大部分情况下并不需要下载到本地。
func persistModelFiles(ctx context.Context, versionInfo *ModelVersion) ([]entities.ModelFile, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelFiles = make([]entities.ModelFile, 0)
	hailEngine := ctx.Value("hail").(*hail.HailAlgorithm)
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
	dbConn.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "identity_hash"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "size", "type", "metadata", "hashes", "primary", "download_url"}),
	}).CreateInBatches(modelFiles, 20)
	return modelFiles, nil
}

// 从civitai的响应中提取出ModelVersion携带的图片信息，但是不会下载图片，所有与实际本地图片有关的字段都将保持为空。
func persistVersionImages(ctx context.Context, versionInfo *ModelVersion) ([]entities.Image, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var images = make([]entities.Image, 0)
	hailEngine := ctx.Value("hail").(*hail.HailAlgorithm)
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
	dbConn.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "version_id"}, {Name: "blur_hash"}},
		DoUpdates: clause.AssignmentColumns([]string{"download_url", "width", "height", "nsfw", "meta", "raw_meta"}),
	}).CreateInBatches(images, 20)
	return images, nil
}

// 解析从Civitai获取到的模型信息。
func parseCivitaiModelResponse(ctx context.Context, modelResponse []byte) (*Model, error) {
	var modelInfo Model
	err := json.Unmarshal(modelResponse, &modelInfo)
	if err != nil {
		return nil, fmt.Errorf("civitai info文件解析失败，%w", err)
	}
	err = persistModel(ctx, &modelInfo, modelResponse)
	if err != nil {
		return nil, fmt.Errorf("无法保存模型信息，%w", err)
	}
	err = persistModelTags(ctx, modelInfo.Id, modelInfo.Tags)
	if err != nil {
		return nil, fmt.Errorf("无法保存模型标签信息，%w", err)
	}
	for _, version := range modelInfo.ModelVersions {
		err = refreshModelVersion(ctx, &version)
		if err != nil {
			return nil, fmt.Errorf("无法保存模型版本信息，%w", err)
		}
	}
	return &modelInfo, err
}

// 保存从Civitai解析到的模型信息，如果模型已经存在，那么将会更新模型信息。
func persistModel(ctx context.Context, modelInfo *Model, original []byte) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	// 检查数据库中是否存在指定模型的记录，但是这个判断结果并不参与后续的模型信息更新。
	var exists int64
	result := dbConn.Model(&entities.Model{}).Where("id = ?", modelInfo.Id).Count(&exists)
	if result.Error != nil {
		return fmt.Errorf("无法检查模型是否存在，%w", result.Error)
	}
	if exists == 0 {
		runtime.EventsEmit(ctx, "cache-status", "not-cached")
	} else {
		runtime.EventsEmit(ctx, "cache-status", "cached")
	}
	model := entities.Model{
		Id:               modelInfo.Id,
		Name:             modelInfo.Name,
		Description:      modelInfo.Description,
		NSFW:             lo.ToPtr(modelInfo.NSFW),
		PersonOfInterest: lo.ToPtr(modelInfo.POI),
		Author: &entities.CivitaiCreator{
			Username: modelInfo.Creator.Username,
			Image:    modelInfo.Creator.Image,
		},
		Type:                    modelInfo.Type,
		Mode:                    modelInfo.Mode,
		CivitaiOriginalResponse: original,
		LastSyncedAt:            lo.ToPtr(time.Now()),
	}
	result = dbConn.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "description", "nsfw", "person_of_interest", "author", "type", "mode", "civitai_original_response", "last_synced_at"}),
	}).Create(&model)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// 保存模型在Civitai上的分类标签信息。保存标签信息是将会首先删除模型对应的全部标签，然后再予以保存。
func persistModelTags(ctx context.Context, modelId int, tags []string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	result := dbConn.Delete(&entities.ModelTags{}, "model_id = ?", modelId)
	if result.Error != nil {
		return fmt.Errorf("未能清理模型已有的标签，%w", result.Error)
	}
	for _, tag := range tags {
		result = dbConn.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "model_id"}, {Name: "tag"}},
			DoNothing: true,
		}).Create(&entities.ModelTags{
			ModelId: modelId,
			Tag:     tag,
		})
		if result.Error != nil {
			return fmt.Errorf("无法保存模型标签，%w", result.Error)
		}
	}
	return nil
}

func refreshModelVersion(ctx context.Context, modelVersion *ModelVersion) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	// 分解组装模型版本中所需要的信息
	var prompts = make([]string, 0)
	for _, word := range modelVersion.TrainedWords {
		for _, prompt := range strings.Split(word, ",") {
			prompts = append(prompts, strings.TrimSpace(prompt))
		}
	}
	// 保存模型版本中携带的文件信息，注意这里的保存可能将会大部分采用更新的方式。
	// 直接从前面的函数中反悔的文件集合可能并不可靠，因为此时数据库中模型版本对应的文件可能是新版本与旧版本文件混杂的情况。
	_, err := persistModelFiles(ctx, modelVersion)
	if err != nil {
		return fmt.Errorf("无法提取模型文件信息，%w", err)
	}
	var files []entities.ModelFile
	result := dbConn.Where(&entities.ModelFile{VersionId: modelVersion.Id}).Find(&files)
	if result.Error != nil {
		return fmt.Errorf("无法获取更新后的模型文件信息，%w", result.Error)
	}
	var versionPrimaryFile *int64
	if len(files) > 0 {
		primaryFile, ok := lo.Find(files, func(f entities.ModelFile) bool {
			return f.Primary != nil && *f.Primary
		})
		if ok {
			versionPrimaryFile = lo.ToPtr(primaryFile.Id)
		} else {
			versionPrimaryFile = lo.ToPtr(files[0].Id)
		}
	} else {
		return fmt.Errorf("模型版本中没有任何文件信息")
	}
	// 保存模型版本中携带的图片信息，注意这里的保存将可能大部分会采用更新的方式。
	// 此处从前面的函数中返回的图片集合可能并不可靠，因为此时数据库中模型版本对应的图片可能是新版本与旧版本图片混杂的情况。
	_, err = persistVersionImages(ctx, modelVersion)
	if err != nil {
		return fmt.Errorf("无法提取模型图片信息，%w", err)
	}
	var images []entities.Image
	result = dbConn.Where(&entities.Image{VersionId: lo.ToPtr(modelVersion.Id)}).Find(&images)
	if result.Error != nil {
		return fmt.Errorf("无法获取更新后的模型图片信息，%w", result.Error)
	}
	var versionCover *string
	if len(images) > 0 {
		versionCover = lo.ToPtr(images[0].Id)
	}
	// 将给定的模型版本信息重新转换为JSON格式。应用过程中的研究发现证明，该部分虽然是包含在Model信息中，但是其内容与直接获取模型版本的信息是相同的。
	original, err := json.Marshal(modelVersion)
	if err != nil {
		return fmt.Errorf("无法序列化模型版本信息，%w", err)
	}
	var newModelVersion = &entities.ModelVersion{
		Id:                      modelVersion.Id,
		ModelId:                 lo.ToPtr(modelVersion.ModelId),
		VersionName:             modelVersion.Name,
		ActivatePrompt:          prompts,
		BaseModel:               modelVersion.BaseModel,
		PageUrl:                 lo.ToPtr(AssembleModelVersionUrl(modelVersion.Id)),
		DownloadUrl:             &modelVersion.DownloadUrl,
		PrimaryFileId:           versionPrimaryFile,
		CoverUsed:               versionCover,
		CivitaiOriginalResponse: original,
		CivitaiCreatedAt:        modelVersion.CreatedAt,
		CivitaiUpdatedAt:        modelVersion.UpdatedAt,
		LastSyncedAt:            lo.ToPtr(time.Now()),
	}
	result = dbConn.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"model_id", "version_name", "activate_prompt", "base_model", "page_url", "download_url", "primary_file_id", "cover_used", "civitai_original_response", "civitai_created_at", "civitai_updated_at", "last_synced_at"}),
	}).Create(newModelVersion)
	if result.Error != nil {
		return fmt.Errorf("无法保存模型版本信息，%w", result.Error)
	}
	return nil
}

// 提供`Remote`包使用的接口。
func ParseRemoteModelResponse(ctx context.Context, modelResponse []byte) (*Model, error) {
	return parseCivitaiModelResponse(ctx, modelResponse)
}
