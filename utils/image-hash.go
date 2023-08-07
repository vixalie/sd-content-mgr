package utils

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"

	"archgrid.xyz/ag/toolsbox/hash/phash"
)

// 计算指定路径图片文件的感知Hash值
func PHashImage(imagePath string) (string, error) {
	imageContent, err := os.Open(imagePath)
	if err != nil {
		return "", fmt.Errorf("未能打开图片文件，%w", err)
	}
	defer imageContent.Close()
	img, _, err := image.Decode(imageContent)
	if err != nil {
		return "", fmt.Errorf("未能解析图片文件，%w", err)
	}
	imgHash := phash.HashHex(img)
	return imgHash, nil
}
