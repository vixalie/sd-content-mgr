package entities

import "time"

type Image struct {
	CommonFields
	Id             string          `gorm:"primaryKey;type:text"`
	VersionId      *int            `gorm:"type:integer;index"`
	Version        *ModelVersion   `gorm:"foreignKey:VersionId;references:Id"`
	FileName       string          `gorm:"type:text"`
	BlurHash       string          `gorm:"type:text"`
	Fingerprint    *string         `gorm:"type:text;unique"`
	LocalStorePath *string         `gorm:"type:text"`
	DownloadUrl    string          `gorm:"type:text"`
	DownloadedAt   *time.Time      `gorm:"type:datetime"`
	Width          *int            `gorm:"type:integer"`
	Height         *int            `gorm:"type:integer"`
	Size           *uint64         `gorm:"type:integer"`
	NSFW           *int            `gorm:"type:integer"`
	Meta           *map[string]any `gorm:"type:text;serializer:json"`
	RawMeta        []byte          `gorm:"type:blob"`
}
