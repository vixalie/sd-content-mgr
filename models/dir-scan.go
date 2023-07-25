package models

import (
	"fmt"
	"os"

	"github.com/vixalie/sd-content-manager/config"
)

func scanModelSubCategoryDirs(software, model string) ([]string, error) {
	var subCategoryDirs = make([]string, 0)
	switch config.MatchSoftware(software) {
	case config.ComfyUI:
		dirs, err := scanComfyUIModelSubDirs(model)
		if err != nil {
			return subCategoryDirs, err
		}
		subCategoryDirs = append(subCategoryDirs, dirs...)
	case config.WebUI:
		dirs, err := scanWebUIModelSubDirs(model)
		if err != nil {
			return subCategoryDirs, err
		}
		subCategoryDirs = append(subCategoryDirs, dirs...)
	}
	return subCategoryDirs, nil
}

func scanComfyUIModelSubDirs(model string) ([]string, error) {
	var (
		subCategoryDirs = make([]string, 0)
	)
	targetScanDir, err := config.GetComfyModelPath(model)
	if err != nil {
		return subCategoryDirs, err
	}
	for _, target := range targetScanDir {
		if len(target) == 0 {
			continue
		}
		if _, err := os.Stat(target); os.IsNotExist(err) {
			return subCategoryDirs, fmt.Errorf("目录不存在：%s", target)
		}
		entries, err := os.ReadDir(target)
		if err != nil {
			return subCategoryDirs, fmt.Errorf("读取目录失败：%s", target)
		}
		for _, entry := range entries {
			if entry.IsDir() {
				subCategoryDirs = append(subCategoryDirs, entry.Name())
			}
		}
	}
	return subCategoryDirs, nil
}

func scanWebUIModelSubDirs(model string) ([]string, error) {
	var (
		subCategoryDirs = make([]string, 0)
	)
	targetScanDir, err := config.GetWebUIModelPath(model)
	if err != nil {
		return subCategoryDirs, err
	}
	for _, target := range targetScanDir {
		if len(target) == 0 {
			continue
		}
		if _, err := os.Stat(target); os.IsNotExist(err) {
			return subCategoryDirs, fmt.Errorf("目录不存在：%s", target)
		}
		entries, err := os.ReadDir(target)
		if err != nil {
			return subCategoryDirs, fmt.Errorf("读取目录失败：%s", target)
		}
		for _, entry := range entries {
			if entry.IsDir() {
				subCategoryDirs = append(subCategoryDirs, entry.Name())
			}
		}
	}
	return subCategoryDirs, nil
}
