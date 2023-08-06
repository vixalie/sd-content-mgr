package models

import (
	"context"
	"fmt"

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
