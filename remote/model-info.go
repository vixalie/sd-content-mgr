package remote

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/models"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sync/semaphore"
	"gorm.io/gorm"
)

func RefreshModelInfo(ctx context.Context, modelId int) error {
	modelInfoUrl := models.AssembleModelUrl(modelId)
	runtime.LogDebugf(ctx, "刷新模型信息，URL：%s", modelInfoUrl)
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	resp, err := client.Get(modelInfoUrl)
	if err != nil {
		return fmt.Errorf("无法访问Civitai，%w", err)
	}
	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			runtime.EventsEmit(ctx, "model-found", "not-found")
			dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
			result := dbConn.Model(&entities.Model{}).Where("id = ?", modelId).Update("civitail_deleted", true)
			if result.Error != nil {
				return fmt.Errorf("无法更新模型被删除信息，%w", result.Error)
			}
		}
		return fmt.Errorf("Civitai返回错误状态码：%d", resp.StatusCode)
	} else {
		runtime.EventsEmit(ctx, "model-found", "found")
	}
	originalModelContent, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("无法读取Civitai返回内容，%w", err)
	}
	_, err = models.ParseRemoteModelResponse(ctx, originalModelContent)
	if err != nil {
		return fmt.Errorf("解析Civitai返回内容失败，%w", err)
	}
	return nil
}

type BatchUpdateEventPayload struct {
	ModelId   int    `json:"id"`
	ModelName string `json:"name"`
	Status    string `json:"status"`
	Retries   int64  `json:"retries"`
	Message   string `json:"message"`
}

func batchUpdateModelInfo(ctx context.Context) error {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var models []entities.Model
	result := dbConn.Find(&models)
	if result.Error != nil {
		return fmt.Errorf("无法获取模型列表，%w", result.Error)
	}
	var (
		semaphore = semaphore.NewWeighted(5)
		wg        sync.WaitGroup
		taskQueue = make([]entities.Model, 0)
		now       = time.Now()
	)
	for _, model := range models {
		if !model.CivitailDeleted && (model.LastSyncedAt == nil || model.LastSyncedAt.Add(30*24*time.Hour).Before(now)) {
			taskQueue = append(taskQueue, model)
		}
	}
	wg.Add(len(taskQueue))
	for _, model := range taskQueue {
		if err := semaphore.Acquire(ctx, 1); err != nil {
			return fmt.Errorf("更新控制过程失败，无法继续更新模型信息，%w", err)
		}
		go batchUpdateModelTask(ctx, semaphore, &wg, model.Id, model.Name)
	}
	wg.Wait()
	runtime.EventsEmit(ctx, "model-update-all-done", "")
	return nil
}

func batchUpdateModelTask(ctx context.Context, weighted *semaphore.Weighted, wg *sync.WaitGroup, modelId int, modelName string) {
	defer weighted.Release(1)
	defer wg.Done()
	defer time.Sleep(5 * time.Second)

	var success bool = false
	modelInfoUrl := models.AssembleModelUrl(modelId)
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	var retries int64
	for retries = 0; retries < 3; retries++ {
		runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "start", retries, "正在获取模型信息……"})
		var originalModelContent []byte
		resp, err := client.Get(modelInfoUrl)
		if err != nil {
			runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "error", retries, fmt.Sprintf("无法访问Civitai，%s", err.Error())})
			goto RETRY_DELAY
		}
		if resp.StatusCode != http.StatusOK {
			if resp.StatusCode == http.StatusNotFound {
				dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
				dbConn.Model(&entities.Model{}).Where("id = ?", modelId).Update("civitail_deleted", true)
				success = true
				break
			}
			runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "error", retries, fmt.Sprintf("Civitai返回错误状态码：%d", resp.StatusCode)})
			goto RETRY_DELAY
		}
		originalModelContent, err = io.ReadAll(resp.Body)
		if err != nil {
			runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "error", retries, fmt.Sprintf("无法读取Civitai返回内容，%s", err.Error())})
			goto RETRY_DELAY
		}
		_, err = models.ParseRemoteModelResponse(ctx, originalModelContent)
		if err != nil {
			runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "error", retries, fmt.Sprintf("解析Civitai返回内容失败，%s", err.Error())})
			goto RETRY_DELAY
		} else {
			success = true
			break
		}
	RETRY_DELAY:
		time.Sleep(time.Duration(5*intPow(3, retries)) * time.Second)
	}
	if success {
		runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "success", 0, "模型信息更新成功。"})
	} else {
		runtime.EventsEmit(ctx, "model-update", BatchUpdateEventPayload{modelId, modelName, "failed", retries, "模型信息更新失败。"})
	}
}

func intPow(n, x int64) int64 {
	var (
		result int64 = 1
		i      int64
	)
	for i = 1; i <= x; i++ {
		result *= n
	}
	return result
}
