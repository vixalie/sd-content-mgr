package models

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type SimplifiedModelVersion struct {
	Id          int    `gorm:"primaryKey;type:integer" json:"id"`
	VersionName string `gorm:"type:text" json:"versionName"`
}

func fetchSimplifiedModelVersions(ctx context.Context, modelVersionId int) ([]SimplifiedModelVersion, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").Preload("Model.Versions").First(&modelVersion, modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	relatedModelVersions := lo.Map(modelVersion.Model.Versions, func(version entities.ModelVersion, _ int) SimplifiedModelVersion {
		return SimplifiedModelVersion{
			Id:          version.Id,
			VersionName: version.VersionName,
		}
	})
	return relatedModelVersions, result.Error
}

func fetchModelImage(ctx context.Context, imageId string) (entities.Image, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var image entities.Image
	result := dbConn.First(&image, "id = ?", imageId)
	return image, result.Error
}

func fetchModelVersionFiles(ctx context.Context, modelVersionId int) ([]*entities.ModelFile, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Preload("Files").First(&modelVersion, "id = ?", modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	runtime.LogDebugf(ctx, "Scaned files: %+v", modelVersion.Files)
	return lo.ToSlicePtr(modelVersion.Files), nil
}

func fetchModelVersionPrimaryFile(ctx context.Context, modelVersionId int) (*entities.FileCache, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("PrimaryFile").Joins("PrimaryFile.LocalFile").First(&modelVersion, "model_versions.id = ?", modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	runtime.LogDebugf(ctx, "Scaned primary file: %+v", modelVersion.PrimaryFile.LocalFile)
	return modelVersion.PrimaryFile.LocalFile, nil
}

func fetchModelVersionDescription(ctx context.Context, modelVersionId int) (*string, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").First(&modelVersion, "model_versions.id = ?", modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	if modelVersion.Model == nil {
		return nil, nil
	}
	return modelVersion.Model.Description, nil
}

func fetchModelTags(ctx context.Context, modelId int) ([]string, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var model entities.Model
	result := dbConn.Preload("Tags").First(&model, "id = ?", modelId)
	if result.Error != nil {
		return nil, fmt.Errorf("未能获取模型标签，%w", result.Error)
	}
	tags := lo.Map(model.Tags, func(tag entities.ModelTags, _ int) string {
		return tag.Tag
	})
	return tags, nil
}

// 本项检查仅仅是检查数据库中指定模型版本是否存在对应的本地文件记录，并且这些记录是否存在本地对应的文件。
// 对于本地已经存在但是本函数报文件不存在的情况，访问一次对应的文件夹扫描一次即可解决。
func checkModelVersionDownloaded(ctx context.Context, modelVersionId int) (bool, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("PrimaryFile").First(&modelVersion, "model_versions.id = ?", modelVersionId)
	if result.Error != nil {
		return false, fmt.Errorf("未能获取模型版本，%w", result.Error)
	}
	if modelVersion.PrimaryFile == nil {
		return false, nil
	}
	var localFiles []*entities.FileCache
	result = dbConn.Where("file_identity_hash = ?", modelVersion.PrimaryFile.IdentityHash).Find(&localFiles)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return false, nil
	}
	if result.Error != nil {
		return false, fmt.Errorf("未能获取本地文件记录，%w", result.Error)
	}
	var exists bool
	for _, file := range localFiles {
		_, err := os.Stat(file.FullPath)
		exists = exists || !os.IsNotExist(err)
	}
	return exists, nil
}
