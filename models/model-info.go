package models

import (
	"context"

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
	result := dbConn.Joins("Model").First(&modelVersion, modelVersionId)
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

func fetchModelVersionFiles(ctx context.Context, modelVersionId int) ([]*entities.FileCache, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Preload("Files").Preload("Files.LocalFile").First(&modelVersion, "id = ?", modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	files := lo.Map(modelVersion.Files, func(file entities.ModelFile, _ int) *entities.FileCache {
		return file.LocalFile
	})
	runtime.LogDebugf(ctx, "Scaned files: %+v", files)
	return files, nil
}
