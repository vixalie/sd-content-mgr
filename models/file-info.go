package models

import (
	"context"

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
