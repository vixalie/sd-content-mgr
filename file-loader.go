package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/vixalie/sd-content-manager/remote"
)

type FileLoader struct {
	ctx context.Context
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) SetContext(ctx context.Context) {
	h.ctx = ctx
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	requestPath := req.URL.Path
	switch {
	case strings.HasPrefix(requestPath, "/local_file/"):
		requestedFilename := strings.TrimPrefix(requestPath, "/local_file/")
		reqFile, err := os.Open(requestedFilename)
		if err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("无法打开文件 %s", requestedFilename)))
			return
		}
		if _, err := io.Copy(res, reqFile); err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("无法加载文件 %s", requestedFilename)))
			return
		}
	case strings.HasPrefix(requestPath, "/model_version_image/"):
		requestImageId := strings.TrimSuffix(strings.TrimPrefix(requestPath, "/model_version_image/"), ".image")
		image, err := remote.FetchImageFile(h.ctx, requestImageId)
		if err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("未找到指定图片文件记录 %s", requestImageId)))
			return
		}
		if err := remote.SureImageFile(h.ctx, image); err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("无法将图片文件缓存到本地 %s", requestImageId)))
			return
		}
		reqFile, err := os.Open(*image.LocalStorePath)
		if err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("无法打开图片文件 %s", requestImageId)))
			return
		}
		if _, err := io.Copy(res, reqFile); err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("无法加载图片文件 %s", requestImageId)))
			return
		}
	default:
		res.WriteHeader(http.StatusBadRequest)
	}
}
