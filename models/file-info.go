package models

import (
	"context"
	"errors"

	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"gorm.io/gorm"
)

func fetchUncachedFileInfo(ctx context.Context, fileId string) (*entities.FileCache, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var fileCache entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&fileCache)
	return &fileCache, result.Error
}

func fetchCachedModelInfo(ctx context.Context, modelVersionId int) (*entities.ModelVersion, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").Preload("Covers").First(&modelVersion, modelVersionId)
	if result.Error != nil {
		return nil, errors.New("指定获取的已缓存模型信息实际为未缓存模型")
	}
	return &modelVersion, result.Error
}
