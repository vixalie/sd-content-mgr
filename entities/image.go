package entities

import "time"

type Image struct {
	CommonFields
	Id              string                  `gorm:"primaryKey;type:text"`
	FileName        string                  `gorm:"type:text"`
	BlurHash        string                  `gorm:"type:text"`
	Fingerprint     string                  `gorm:"type:text;unique"`
	DownloadUrl     string                  `gorm:"type:text"`
	DownloadedAt    *time.Time              `gorm:"type:time"`
	Width           *int                    `gorm:"type:integer"`
	Height          *int                    `gorm:"type:integer"`
	Size            *uint64                 `gorm:"type:integer"`
	NSFW            *int                    `gorm:"type:integer"`
	Meta            *map[string]interface{} `gorm:"type:text;serializer:json"`
	RawMeta         []byte                  `gorm:"type:blob"`
	PositivePrompt  *string                 `gorm:"type:text"`
	NegativePrompt  *string                 `gorm:"type:text"`
	BaseModel       *string                 `gorm:"type:text"`
	BaseModelHash   *string                 `gorm:"type:text"`
	Sampler         *string                 `gorm:"type:text"`
	CFGParam        *int                    `gorm:"type:integer"`
	ClipSkip        *int                    `gorm:"type:integer"`
	Steps           *int                    `gorm:"type:integer"`
	Seed            *int64                  `gorm:"type:integer"`
	HiresUpscale    *int                    `gorm:"type:integer"`
	HiresUpscaler   *string                 `gorm:"type:text"`
	DenoiseStrength *float64                `gorm:"type:float"`
}
