package remote

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/models"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

func refreshModelVersionInfoByHash(ctx context.Context, hash string) (*int, error) {
	hashInfoUrl := models.AssembleModelVersionByHashUrl(hash)
	runtime.LogDebugf(ctx, "利用Hash刷新模型版本信息，URL：%s", hashInfoUrl)
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	resp, err := client.Get(hashInfoUrl)
	if err != nil {
		return nil, fmt.Errorf("无法访问Civitai，%w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Civitai返回错误状态码：%d", resp.StatusCode)
	}
	originalModelVersionContent, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("无法读取Civitai返回内容，%w", err)
	}
	version, err := models.ParseCivitaiModelVersionResponse(ctx, originalModelVersionContent)
	if err != nil {
		return nil, fmt.Errorf("解析Civitai返回内容失败，%w", err)
	}
	err = writeCivitaiInfoFile(ctx, hash, originalModelVersionContent)
	if err != nil {
		return nil, fmt.Errorf("写入Civitai信息文件失败，%w", err)
	}
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	result := dbConn.Model(&entities.FileCache{}).Where("file_identity_hash = ?", hash).Update("related_model_version_id", version.Id)
	if result.Error != nil {
		return nil, fmt.Errorf("更新文件关联模型版本信息失败，%w", result.Error)
	}
	return &version.Id, nil
}

func writeCivitaiInfoFile(ctx context.Context, hash string, content []byte) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var fileInfo entities.FileCache
	result := dbConn.First(&fileInfo, "file_identity_hash = ?", hash)
	if result.Error != nil {
		return fmt.Errorf("未能找到指定Hash对应的模型版本，%w", result.Error)
	}
	fileBaseName := filepath.Base(fileInfo.FullPath)
	filePath := filepath.Dir(fileInfo.FullPath)
	fileExt := filepath.Ext(fileBaseName)
	fileName := strings.TrimSuffix(fileBaseName, fileExt)
	civitaiInfoPath := filepath.Join(filePath, fileName+".civitai.info")
	err := os.WriteFile(civitaiInfoPath, content, 0644)
	if err != nil {
		return fmt.Errorf("写入Civitai信息文件失败，%w", err)
	}
	fileInfo.CivitaiInfoPath = lo.ToPtr(civitaiInfoPath)
	result = dbConn.Save(&fileInfo)
	if result.Error != nil {
		return fmt.Errorf("更新文件关联模型版本信息文件失败，%w", result.Error)
	}
	return nil
}
