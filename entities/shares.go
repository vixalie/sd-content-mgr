package entities

import (
	"time"

	"gorm.io/gorm"
)

const (
	ModelCKPT int = iota
	ModelTI
	ModelHypernet
	ModelLora
	ModelLyCORIS
	ModelLoha
	ModelControlnet
	ModelVAE
)

const (
	PrecisionFP16 int = iota
	PrecisionFP32
)

type CommonFields struct {
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
