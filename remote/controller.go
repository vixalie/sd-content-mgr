package remote

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type RemoteController struct {
	ctx context.Context
}

func NewRemoteController() *RemoteController {
	return &RemoteController{}
}

func (r *RemoteController) SetContext(ctx context.Context) {
	r.ctx = ctx
}

func (r RemoteController) RefreshModelInfo(modelId int) error {
	return RefreshModelInfo(r.ctx, modelId)
}

func (r RemoteController) RefreshModelVersionInfoByHash(fileHash string) (*int, error) {
	return refreshModelVersionInfoByHash(r.ctx, fileHash)
}

func (r RemoteController) DownloadModelVersion(uiTools, cateSubPath, fileName string, versionId int, overwrite bool) error {
	runtime.LogDebugf(r.ctx, "Download Model: %s, %s, %s, %d, %t", uiTools, cateSubPath, fileName, versionId, overwrite)
	return downloadModelVersion(r.ctx, uiTools, cateSubPath, fileName, versionId, overwrite)
}

func (r RemoteController) RecheckModelExistence(modelId int) error {
	return recheckModelExistenceState(r.ctx, modelId)
}
