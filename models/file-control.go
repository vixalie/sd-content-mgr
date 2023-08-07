package models

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/utils"
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

func recordModelActivatePrompts(ctx context.Context, fileId, prompts string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	newPrompts := lo.Map(strings.Split(prompts, ","), func(prompt string, _ int) string {
		return strings.TrimSpace(prompt)
	})
	file.AdditionalPrompts = lo.Uniq(append(file.AdditionalPrompts, newPrompts...))
	result = dbConn.Save(&file)
	return result.Error
}

func deleteModelPrompts(ctx context.Context, fileId string, prompts []string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	file.AdditionalPrompts = lo.Uniq(lo.Reject(file.AdditionalPrompts, func(prompt string, _ int) bool {
		return lo.Contains(prompts, prompt)
	}))
	result = dbConn.Save(&file)
	return result.Error
}

func copyModelThumbnail(modelFileFullPath, originImageFilePath string) (string, error) {
	_, err := os.Stat(originImageFilePath)
	if os.IsNotExist(err) {
		return "", fmt.Errorf("文件系统中不存在指定的缩略图源文件，%w", err)
	}
	imageExt := filepath.Ext(originImageFilePath)
	fileName := strings.TrimSuffix(filepath.Base(modelFileFullPath), filepath.Ext(modelFileFullPath))
	thumbnailPath := filepath.Join(filepath.Dir(modelFileFullPath), fileName+".preview"+imageExt)
	targetThumbnailFile, err := os.Create(thumbnailPath)
	if err != nil {
		return "", fmt.Errorf("创建缩略图文件失败，%w", err)
	}
	defer targetThumbnailFile.Close()
	originImageFile, err := os.Open(originImageFilePath)
	if err != nil {
		return "", fmt.Errorf("打开缩略图源文件失败，%w", err)
	}
	defer originImageFile.Close()
	_, err = io.Copy(targetThumbnailFile, originImageFile)
	if err != nil {
		return "", fmt.Errorf("复制缩略图失败，%w", err)
	}
	return thumbnailPath, nil
}

func copyFileThumbnail(ctx context.Context, fileId, originImageFilePath string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var file entities.FileCache
	result := dbConn.Where("id = ?", fileId).First(&file)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的文件记录，%w", result.Error)
	}
	if file.ThumbnailPath != nil {
		_, err := os.Stat(*file.ThumbnailPath)
		if !os.IsNotExist(err) {
			err = os.Remove(*file.ThumbnailPath)
			if err != nil {
				return fmt.Errorf("删除原缩略图失败，%w", err)
			}
		}
	}
	thumbnailPath, err := copyModelThumbnail(file.FullPath, originImageFilePath)
	if err != nil {
		return nil
	}
	thumbnailHash, err := utils.PHashImage(thumbnailPath)
	if err != nil {
		return fmt.Errorf("计算缩略图哈希值失败，%w", err)
	}
	file.ThumbnailPath = &thumbnailPath
	file.ThumbnailPHash = &thumbnailHash
	result = dbConn.Save(&file)
	return result.Error
}

func copyModelImageAsModelThumbnail(ctx context.Context, modelId int, imageId string) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var imageFile entities.Image
	result := dbConn.First(&imageFile, "id = ?", imageId)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的模型图集文件，%w", result.Error)
	}
	if imageFile.LocalStorePath == nil {
		return fmt.Errorf("指定的模型图集文件未缓存或未记录，%w", result.Error)
	}
	_, err := os.Stat(*imageFile.LocalStorePath)
	if os.IsNotExist(err) {
		return fmt.Errorf("文件系统中不存在指定的模型图集文件，%w", err)
	}
	var model entities.ModelVersion
	result = dbConn.Joins("PrimaryFile").Joins("PrimaryFile.LocalFile").First(&model, "model_versions.id = ?", modelId)
	if result.Error != nil {
		return fmt.Errorf("未找到指定的模型，%w", result.Error)
	}
	if model.PrimaryFile == nil {
		return fmt.Errorf("指定的模型未记录主文件，%w", result.Error)
	}
	if model.PrimaryFile.LocalFile == nil {
		return fmt.Errorf("指定的模型主文件未下载到本地或未记录，%w", result.Error)
	}
	err = copyFileThumbnail(ctx, model.PrimaryFile.LocalFile.Id, *imageFile.LocalStorePath)
	if err != nil {
		return err
	}
	model.CoverUsed = &imageFile.Id
	result = dbConn.Save(&model)
	return result.Error
}
