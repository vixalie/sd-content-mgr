package entities

import (
	"strings"
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

const (
	NSFWLeveNone int = iota
	NSFWLevelSoft
	NSFWLevelMature
	NSFWLevelX
)

type CommonFields struct {
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func ConvertModelType(modelType string) int {
	switch strings.ToLower(modelType) {
	case "checkpoint":
		return ModelCKPT
	case "textureinversion":
		return ModelTI
	case "hypernetwork":
		return ModelHypernet
	case "lora":
		return ModelLora
	case "locon":
		return ModelLyCORIS
	case "loha":
		return ModelLoha
	case "controlnet":
		return ModelControlnet
	case "vae":
		return ModelVAE
	default:
		return -1
	}
}

func ConvertPrecision(precision string) int {
	switch strings.ToLower(precision) {
	case "fp16":
		return PrecisionFP16
	case "fp32":
		return PrecisionFP32
	default:
		return -1
	}
}

func ConvertNSFWLevel(nsfwLevel string) int {
	switch strings.ToLower(nsfwLevel) {
	case "none":
		return NSFWLeveNone
	case "soft":
		return NSFWLevelSoft
	case "mature":
		return NSFWLevelMature
	case "x":
		return NSFWLevelX
	default:
		return -1
	}
}
