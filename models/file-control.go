package models

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"gorm.io/gorm"
)

func breakModelFileParts(ctx context.Context, fileId string) (string, string, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var fileCache entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&fileCache)
	if result.Error != nil {
		return "", "", fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	fileBaseName := filepath.Base(fileCache.FullPath)
	fileExt := filepath.Ext(fileBaseName)
	fileName := strings.TrimSuffix(fileBaseName, fileExt)
	return fileName, fileExt, nil
}

func renameModelFile(ctx context.Context, fileId, newName string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	_, err := os.Stat(file.FullPath)
	if os.IsNotExist(err) {
		return fmt.Errorf("文件系统中不存在指定的模型文件，%w", err)
	}
	filePath := filepath.Dir(file.FullPath)
	filExt := filepath.Ext(file.FullPath)
	newFilePath := filepath.Join(filePath, newName+filExt)
	err = os.Rename(file.FullPath, newFilePath)
	if err != nil {
		return fmt.Errorf("重命名文件失败，%w", err)
	}
	file.FileName = filepath.Base(newFilePath)
	file.FullPath = newFilePath
	if file.ThumbnailPath != nil {
		thumbnailExt := filepath.Ext(*file.ThumbnailPath)
		newThumbnailPath := filepath.Join(filePath, newName+".preview"+thumbnailExt)
		err = os.Rename(*file.ThumbnailPath, newThumbnailPath)
		if err != nil {
			return fmt.Errorf("重命名缩略图失败，%w", err)
		}
		file.ThumbnailPath = &newThumbnailPath
	}
	if file.CivitaiInfoPath != nil {
		newCivitaiInfoPath := filepath.Join(filePath, newName+".civitai.info")
		err = os.Rename(*file.CivitaiInfoPath, newCivitaiInfoPath)
		if err != nil {
			return fmt.Errorf("重命名Civitai信息文件失败，%w", err)
		}
		file.CivitaiInfoPath = &newCivitaiInfoPath
	}
	result = dbConn.Save(&file)
	return result.Error
}

func recordCustomBaseModel(ctx context.Context, fileId, baseModel string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	file.BaseModel = &baseModel
	result = dbConn.Save(&file)
	return result.Error
}

func recordModelMemo(ctx context.Context, fileId, memo string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	file.Memo = &memo
	result = dbConn.Save(&file)
	return result.Error
}
