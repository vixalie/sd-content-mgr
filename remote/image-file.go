package remote

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/utils"
	"gorm.io/gorm"
)

func FetchImageFile(ctx context.Context, imageFileId string) (*entities.Image, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var imageFile entities.Image
	result := dbConn.First(&imageFile, "id = ?", imageFileId)
	if result.Error != nil {
		return nil, result.Error
	}
	return &imageFile, nil
}

// 本函数将确保指定的图片已经缓存在了本地。即如果本地不存在图片的记录，那么将会从远程下载图片并保存到本地，同时会向前端发出下载进度事件。
func SureImageFile(ctx context.Context, image *entities.Image) error {
	if image.LocalStorePath != nil {
		_, err := os.Stat(*image.LocalStorePath)
		if !os.IsNotExist(err) {
			return nil
		}
	}
	client := http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(config.GetProxyUrl()),
		},
	}
	downloadEvent := DownloadEvent{
		ctx:     ctx,
		EventId: image.Id,
	}
	downloadEvent.Start()
	resp, err := client.Get(image.DownloadUrl)
	if err != nil {
		fmt.Printf("无法访问Civitai，%s", err.Error())
		downloadEvent.Failed(fmt.Errorf("无法访问Civitai，%w", err))
		return fmt.Errorf("无法访问Civitai，%w", err)
	}
	imageFilePath := filepath.Join(config.SettingPath, "model-images")
	if err := os.MkdirAll(imageFilePath, os.ModePerm); err != nil {
		fmt.Printf("创建图片文件保存目录失败，%s", err.Error())
		downloadEvent.Failed(fmt.Errorf("创建图片文件保存目录失败，%w", err))
		return fmt.Errorf("创建图片文件保存目录失败，%w", err)
	}
	var imageFileName string
	switch resp.Header.Get("Content-Type") {
	case "image/png":
		imageFileName = filepath.Join(imageFilePath, image.Id+".png")
	case "image/jpeg":
		imageFileName = filepath.Join(imageFilePath, image.Id+".jpg")
	case "image/webp":
		imageFileName = filepath.Join(imageFilePath, image.Id+".webp")
	default:
		downloadEvent.Failed(errors.New("不支持的图片格式"))
		return errors.New("不支持的图片格式")
	}
	targetFile, err := os.OpenFile(imageFileName, os.O_RDWR|os.O_CREATE, 0755)
	if err != nil {
		fmt.Printf("创建图片文件失败，%s", err.Error())
		downloadEvent.Failed(fmt.Errorf("创建图片文件失败，%w", err))
		return fmt.Errorf("创建图片文件失败，%w", err)
	}
	defer targetFile.Close()
	if _, err := io.Copy(targetFile, io.TeeReader(resp.Body, &downloadEvent)); err != nil {
		fmt.Printf("保存图片文件失败，%s", err.Error())
		downloadEvent.Failed(fmt.Errorf("保存图片文件失败，%w", err))
		return fmt.Errorf("保存图片文件失败，%w", err)
	}
	hash, err := utils.PHashImage(imageFileName)
	if err != nil {
		fmt.Printf("计算图片指纹失败，%s", err.Error())
		downloadEvent.Failed(fmt.Errorf("计算图片指纹失败，%w", err))
		return fmt.Errorf("计算图片指纹失败，%w", err)
	}
	image.LocalStorePath = &imageFileName
	image.Fingerprint = &hash
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	dbConn.Save(image)
	downloadEvent.Finish()
	return nil
}
