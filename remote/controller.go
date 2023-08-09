package remote

import "context"

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

func (r RemoteController) DownloadModelVersion(uiTools, cateSubPath string, versionId int) error {
	return downloadModelVersion(r.ctx, uiTools, cateSubPath, versionId)
}
