package models

import (
	"context"
	"fmt"
	"strings"

	"github.com/vixalie/sd-content-manager/entities"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ModelController struct {
	ctx context.Context
}

func NewModelController() *ModelController {
	return &ModelController{}
}

func (m *ModelController) SetContext(ctx context.Context) {
	m.ctx = ctx
}

func (m ModelController) GetModelSubCategoryDirs(software, model string) ([]string, error) {
	return scanModelSubCategoryDirs(software, model)
}

func (m ModelController) ListModelFiles(software, model, subdir, keyword string) ([]SimpleModelDescript, error) {
	return scanModelFiles(m.ctx, software, model, subdir, keyword)
}

func (m ModelController) FetchUncachedFileInfo(fileId string) (*entities.FileCache, error) {
	return fetchUncachedFileInfo(m.ctx, fileId)
}

func (m ModelController) FetchCachedFileInfo(modelId int) (*entities.ModelVersion, error) {
	return fetchCachedModelInfo(m.ctx, modelId)
}

func (m ModelController) FetchSameSerialVersions(modelVersionId int) ([]SimplifiedModelVersion, error) {
	return fetchSimplifiedModelVersions(m.ctx, modelVersionId)
}

func (m ModelController) BreakModelFileParts(fileId string) ([]string, error) {
	fileName, fileExt, err := breakModelFileParts(m.ctx, fileId)
	return []string{fileName, fileExt}, err
}

func (m ModelController) RenameModelFile(fileId, newName string) error {
	return renameModelFile(m.ctx, fileId, newName)
}

func (m ModelController) FetchModelVersionPrimaryFile(modelVersionId int) (*entities.FileCache, error) {
	return fetchModelVersionPrimaryFile(m.ctx, modelVersionId)
}

func (m ModelController) RecordFileBaseModel(fileId, baseModel string) error {
	return recordCustomBaseModel(m.ctx, fileId, baseModel)
}

func (m ModelController) RecordFileMemo(fileId, memo string) error {
	return recordModelMemo(m.ctx, fileId, memo)
}

func (m ModelController) RecordFilePrompts(fileId, prompts string) error {
	return recordModelActivatePrompts(m.ctx, fileId, prompts)
}

func (m ModelController) DeleteFilePrompts(fileId string, prompts []string) error {
	return deleteModelPrompts(m.ctx, fileId, prompts)
}

func (m ModelController) ChooseAndSetFileThumbnail(fileId string) (bool, error) {
	selectedFile, err := runtime.OpenFileDialog(m.ctx, runtime.OpenDialogOptions{
		Title: "选择缩略图来源文件",
		Filters: []runtime.FileFilter{
			{DisplayName: "图片文件", Pattern: "*.jpg;*.jpeg;*.png"},
		},
	})
	if err != nil {
		return false, fmt.Errorf("未指定缩略图来源文件，%w", err)
	}
	if len(selectedFile) == 0 {
		return false, nil
	}
	err = copyFileThumbnail(m.ctx, fileId, selectedFile)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (m ModelController) FetchModelImage(imageId string) (entities.Image, error) {
	return fetchModelImage(m.ctx, imageId)
}

func (m ModelController) FetchModelLocalFiles(modelVersionId int) ([]*entities.ModelFile, error) {
	return fetchModelVersionFiles(m.ctx, modelVersionId)
}

func (m ModelController) SetModelVersionThumbnail(modelVersionId int, imageId string) error {
	return copyModelImageAsModelThumbnail(m.ctx, modelVersionId, imageId)
}

func (m ModelController) FetchModelVersionDescription(modelVersionId int) (string, error) {
	description, err := fetchModelVersionDescription(m.ctx, modelVersionId)
	if err != nil {
		return "", err
	}
	if description == nil {
		return "", nil
	}
	return *description, nil
}

func (m ModelController) CopyModelFileLoader(modelVersionId int) error {
	modelVersion, err := fetchCachedModelInfo(m.ctx, modelVersionId)
	if err != nil {
		return err
	}
	versionPrimaryFile, err := fetchModelVersionPrimaryFile(m.ctx, modelVersionId)
	if err != nil {
		return err
	}
	if versionPrimaryFile == nil {
		return fmt.Errorf("未找到模型文件")
	}
	fileName, _, err := breakModelFileParts(m.ctx, versionPrimaryFile.Id)
	if err != nil {
		return err
	}
	switch strings.ToLower(modelVersion.Model.Type) {
	case "lora":
		runtime.ClipboardSetText(m.ctx, fmt.Sprintf("<lora:%s:1>", fileName))
	case "locon":
		runtime.ClipboardSetText(m.ctx, fmt.Sprintf("<lyco:%s:1>", fileName))
	case "textualinversion":
		fallthrough
	case "hypernet":
		runtime.ClipboardSetText(m.ctx, fileName)
	default:
		return fmt.Errorf("模型不支持提示词加载语法")
	}
	return nil
}

func (m ModelController) FetchModelTags(modelId int) ([]string, error) {
	return fetchModelTags(m.ctx, modelId)
}
