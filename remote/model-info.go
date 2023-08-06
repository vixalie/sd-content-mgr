package remote

import (
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/models"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
		return fmt.Errorf("Civitai返回错误状态码：%d", resp.StatusCode)
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
