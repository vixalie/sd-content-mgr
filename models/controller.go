package models

import (
	"context"

	"github.com/vixalie/sd-content-manager/entities"
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

func (m ModelController) BreakModelFileParts(fileId string) ([]string, error) {
	fileName, fileExt, err := breakModelFileParts(m.ctx, fileId)
	return []string{fileName, fileExt}, err
}

func (m ModelController) RenameModelFile(fileId, newName string) error {
	return renameModelFile(m.ctx, fileId, newName)
}

func (m ModelController) RecordFileBaseModel(fileId, baseModel string) error {
	return recordCustomBaseModel(m.ctx, fileId, baseModel)
}
