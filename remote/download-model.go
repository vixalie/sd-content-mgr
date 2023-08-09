package remote

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/utils"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

func downloadModelVersion(ctx context.Context, uiTools, targetCatePath string, modelVerionsId int) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").Joins("PrimaryFile").Preload("Covers").First(&modelVersion, "id = ?", modelVerionsId)
	if result.Error != nil {
		return fmt.Errorf("未能找到已经缓存的模型版本记录，%w", result.Error)
	}
	if len(modelVersion.PrimaryFile.IdentityHash) == 0 {
		return fmt.Errorf("模型版本未指定首要文件")
	}
	ui := config.MatchSoftware(uiTools)
	targetModelPath := filepath.Join(config.ApplicationSetup.CommonPaths()[ui][strings.ToLower(modelVersion.Model.Type)], targetCatePath)
	var wg sync.WaitGroup
	go downloadModelVersionPrimaryFile(ctx, &wg, &modelVersion, targetModelPath)
	go downloadModelVersionThumbnail(ctx, &wg, &modelVersion, targetModelPath)
	go downloadModelVersionInfo(ctx, &wg, &modelVersion, targetModelPath)
	wg.Wait()
	return nil
}

func downloadModelVersionPrimaryFile(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath string) {
	wg.Add(1)
	defer wg.Done()
	targetModelFile := filepath.Join(targetModelPath, modelVersion.PrimaryFile.Name)
	var (
		startOffset int64
		file        *os.File
	)
	stat, err := os.Stat(targetModelFile)
	if os.IsNotExist(err) {
		startOffset = 0
		file, err = os.OpenFile(targetModelFile, os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("创建模型文件失败，%w", err))
			return
		}
	} else {
		startOffset = stat.Size()
		file, err = os.OpenFile(targetModelFile, os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("打开模型文件失败，%w", err))
			return
		}
	}
	defer file.Close()
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	requst := http.Request{
		Method: "GET",
	}
	downloadUrl, err := url.Parse(*modelVersion.DownloadUrl)
	if err != nil {
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("无法解析下载地址，%w", err))
		return
	}
	requst.URL = downloadUrl
	if startOffset > 0 {
		header := http.Header{}
		header.Add("Range", fmt.Sprintf("bytes=%d-", startOffset))
		requst.Header = header
	}
	resp, err := client.Do(&requst)
	if err != nil || resp.StatusCode != http.StatusOK {
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("无法访问Civitai，%w", err))
		return
	}
	defer resp.Body.Close()
	downloadEvent := DownloadEvent{
		ctx:         ctx,
		EventId:     fmt.Sprintf("model-primary-file-%d", modelVersion.Id),
		TotalLength: uint64(resp.ContentLength),
	}
	downloadEvent.Start()
	if resp.ContentLength == 0 {
		downloadEvent.Finish()
		runtime.EventsEmit(ctx, "model-primary-file-download-error", errors.New("模型应该已经下载完成，没有内容需要继续下载"))
		return
	}
	if _, err := io.Copy(file, io.TeeReader(resp.Body, &downloadEvent)); err != nil {
		downloadEvent.Failed(fmt.Errorf("保存模型文件失败，%w", err))
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("保存模型文件失败，%w", err))
		return
	}
	downloadEvent.Finish()
}

func downloadModelVersionThumbnail(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath string) {
	wg.Add(1)
	defer wg.Done()
	fileName, _ := utils.BreakFilename(modelVersion.PrimaryFile.Name)
	usedCover, ok := lo.Find(modelVersion.Covers, func(cover entities.Image) bool {
		return cover.Id == *modelVersion.CoverUsed
	})
	if !ok {
		runtime.LogInfo(ctx, "未找到指定的封面图片，使用第一张图片作为封面。")
		usedCover = modelVersion.Covers[0]
	}
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	resp, err := client.Get(usedCover.DownloadUrl)
	if err != nil {
		runtime.LogErrorf(ctx, "无法访问Civitai，%s", err.Error())
		runtime.EventsEmit(ctx, "model-preview-download-error", fmt.Errorf("无法访问Civitai，%w", err))
		return
	}
	var imageFileName string
	switch resp.Header.Get("Content-Type") {
	case "image/png":
		imageFileName = filepath.Join(targetModelPath, fileName+".preview.png")
	case "image/jpeg":
		imageFileName = filepath.Join(targetModelPath, fileName+".preview.jpg")
	case "image/webp":
		imageFileName = filepath.Join(targetModelPath, fileName+".preview.webp")
	default:
		runtime.EventsEmit(ctx, "model-preview-download-error", errors.New("不支持的图片格式"))
		return
	}
	var file *os.File
	_, err = os.Stat(imageFileName)
	if os.IsNotExist(err) {
		file, err = os.Create(imageFileName)
		if err != nil {
			runtime.EventsEmit(ctx, "model-preview-download-error", fmt.Errorf("创建缩略图文件失败，%w", err))
			return
		}
	} else {
		file, err = os.OpenFile(imageFileName, os.O_TRUNC|os.O_WRONLY, 0644)
		if err != nil {
			runtime.EventsEmit(ctx, "model-preview-download-error", fmt.Errorf("打开缩略图文件失败，%w", err))
			return
		}
	}
	defer file.Close()
	if _, err = io.Copy(file, resp.Body); err != nil {
		runtime.EventsEmit(ctx, "model-preview-download-error", fmt.Errorf("保存缩略图文件失败，%w", err))
		return
	}
}

func downloadModelVersionInfo(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath string) {
	wg.Add(1)
	defer wg.Done()
	fileName, _ := utils.BreakFilename(modelVersion.PrimaryFile.Name)
	infoPath := filepath.Join(targetModelPath, fileName+".civitai.info")
	var file *os.File
	_, err := os.Stat(infoPath)
	if os.IsNotExist(err) {
		file, err = os.OpenFile(infoPath, os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			runtime.EventsEmit(ctx, "model-info-download-error", fmt.Errorf("创建模型信息文件失败，%w", err))
			return
		}
	} else {
		file, err = os.OpenFile(infoPath, os.O_TRUNC|os.O_WRONLY, 0644)
		if err != nil {
			runtime.EventsEmit(ctx, "model-info-download-error", fmt.Errorf("打开模型信息文件失败，%w", err))
			return
		}
	}
	defer file.Close()
	_, err = file.Write(modelVersion.CivitaiOriginalResponse)
	if err != nil {
		runtime.EventsEmit(ctx, "model-info-download-error", fmt.Errorf("写入模型信息文件失败，%w", err))
		return
	}
}
