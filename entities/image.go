package entities

import "time"

type Image struct {
	CommonFields
	Id              string     `gorm:"primaryKey;type:text"`
	FileName        string     `gorm:"type:text"`
	Fingerprint     string     `gorm:"type:text;unique"`
	DownloadUrl     string     `gorm:"type:text"`
	DownloadedAt    *time.Time `gorm:"type:time"`
	Width           *int       `gorm:"type:integer"`
	Height          *int       `gorm:"type:integer"`
	Size            *uint64    `gorm:"type:integer"`
	NSFW            *bool      `gorm:"type:boolean"`
	Meta            *string    `gorm:"type:text;serializer:json"`
	PositivePrompt  *string    `gorm:"type:text"`
	NegativePrompt  *string    `gorm:"type:text"`
	BaseModel       *string    `gorm:"type:text"`
	BaseModelHash   *string    `gorm:"type:text"`
	Sampler         *string    `gorm:"type:text"`
	CFGParam        *int       `gorm:"type:integer"`
	ClipSkip        *int       `gorm:"type:integer"`
	Steps           *int       `gorm:"type:integer"`
	Seed            *int       `gorm:"type:integer"`
	HiresUpscale    *int       `gorm:"type:integer"`
	HiresUpscaler   *string    `gorm:"type:text"`
	DenoiseStrength *float64   `gorm:"type:float"`
}
