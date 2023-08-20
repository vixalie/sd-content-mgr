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

func downloadModelVersion(ctx context.Context, uiTools, targetCatePath, fileName string, modelVerionsId int, overwrite bool) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").Joins("PrimaryFile").Preload("Files").Preload("Covers").First(&modelVersion, "model_versions.id = ?", modelVerionsId)
	if result.Error != nil {
		return fmt.Errorf("未能找到已经缓存的模型版本记录，%w", result.Error)
	}
	if len(modelVersion.PrimaryFile.IdentityHash) == 0 && len(modelVersion.Files[0].IdentityHash) == 0 {
		return fmt.Errorf("模型版本未指定首要文件且文件列表首位文件同样不存在。")
	}
	ui := config.MatchSoftware(uiTools)
	targetModelPath := filepath.Join(config.ApplicationSetup.CommonPaths()[ui][strings.ToLower(modelVersion.Model.Type)], targetCatePath)
	runtime.LogDebugf(ctx, "下载检查点0：目标路径：%s, %s", targetModelPath, fileName)
	var wg sync.WaitGroup
	wg.Add(3)
	go downloadModelVersionPrimaryFile(ctx, &wg, &modelVersion, targetModelPath, fileName, overwrite)
	go downloadModelVersionThumbnail(ctx, &wg, &modelVersion, targetModelPath, fileName)
	go downloadModelVersionInfo(ctx, &wg, &modelVersion, targetModelPath, fileName)
	wg.Wait()
	err := recheckModelExistenceState(ctx, *modelVersion.ModelId)
	if err != nil {
		return fmt.Errorf("检查模型是否已经下载失败，%w", err)
	}
	return nil
}

func downloadModelVersionPrimaryFile(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath, fileName string, overwrite bool) {
	defer wg.Done()
	var ext string
	if modelVersion.PrimaryFile != nil {
		_, ext = utils.BreakFilename(modelVersion.PrimaryFile.Name)
	} else {
		_, ext = utils.BreakFilename(modelVersion.Files[0].Name)
	}
	targetModelFile := filepath.Join(targetModelPath, fileName+ext)
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
		if overwrite {
			startOffset = 0
			file, err = os.OpenFile(targetModelFile, os.O_TRUNC|os.O_WRONLY, 0644)
		} else {
			startOffset = stat.Size()
			file, err = os.OpenFile(targetModelFile, os.O_APPEND|os.O_WRONLY, 0644)
		}
		if err != nil {
			runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("打开模型文件失败，%w", err))
			return
		}
	}
	runtime.LogDebug(ctx, "下载检查点1：文件齐备")
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
	header := http.Header{}
	header.Add("User-Agent", "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148")
	if startOffset > 0 {
		header.Add("Range", fmt.Sprintf("bytes=%d-", startOffset))
	}
	runtime.LogDebugf(ctx, "下载请求头：%+v", header)
	requst.Header = header
	runtime.LogDebug(ctx, "下载检查点2：请求准备完成")
	resp, err := client.Do(&requst)
	if err != nil {
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Sprintf("无法访问Civitai，%s", err.Error()))
		return
	}
	if resp.StatusCode != http.StatusOK {
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Sprintf("无法访问Civitai， HTTP状态码：%d", resp.StatusCode))
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
	runtime.LogDebug(ctx, "下载检查点3：开始下载")
	if _, err := io.Copy(file, io.TeeReader(resp.Body, &downloadEvent)); err != nil {
		downloadEvent.Failed(fmt.Errorf("保存模型文件失败，%w", err))
		runtime.EventsEmit(ctx, "model-primary-file-download-error", fmt.Errorf("保存模型文件失败，%w", err))
		return
	}
	runtime.LogDebug(ctx, "下载检查点4：下载完成")
	downloadEvent.Finish()
	runtime.EventsEmit(ctx, "version-downloaded", "downloaded")
	runtime.EventsEmit(ctx, "model-downloaded", "downloaded")
}

func downloadModelVersionThumbnail(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath, fileName string) {
	defer wg.Done()
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

func downloadModelVersionInfo(ctx context.Context, wg *sync.WaitGroup, modelVersion *entities.ModelVersion, targetModelPath, fileName string) {
	defer wg.Done()
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

func recheckModelExistenceState(ctx context.Context, modelId int) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	runtime.LogDebugf(ctx, "检查模型是否存在：模型ID：%d", modelId)
	// 检查数据库中是否存在指定模型的记录，但是这个判断结果并不参与后续的模型信息更新。
	var model entities.Model
	result := dbConn.First(&model, "models.id = ?", modelId)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		runtime.EventsEmit(ctx, "cache-status", "not-cached")
	} else if result.Error != nil {
		return fmt.Errorf("无法检查模型是否存在，%w", result.Error)
	} else {
		runtime.EventsEmit(ctx, "cache-status", "cached")
	}
	return nil
}
