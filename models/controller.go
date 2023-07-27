package models

import "context"

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
