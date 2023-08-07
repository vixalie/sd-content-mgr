package entities

import "time"

type Image struct {
	CommonFields
	Id             string          `gorm:"primaryKey;type:text" json:"id"`
	VersionId      *int            `gorm:"type:integer;uniqueIndex:versionUnique" json:"versionId"`
	Version        *ModelVersion   `gorm:"foreignKey:VersionId;references:Id" json:"modelVersion"`
	FileName       string          `gorm:"type:text" json:"fileName"`
	BlurHash       string          `gorm:"type:text;uniqueIndex:versionUnique" json:"blurHash"`
	Fingerprint    *string         `gorm:"type:text;unique" json:"fingerprint"`
	LocalStorePath *string         `gorm:"type:text" json:"localPath"`
	DownloadUrl    string          `gorm:"type:text" json:"-"`
	DownloadedAt   *time.Time      `gorm:"type:datetime" json:"-"`
	Width          *int            `gorm:"type:integer" json:"width"`
	Height         *int            `gorm:"type:integer" json:"height"`
	Size           *uint64         `gorm:"type:integer" json:"size"`
	NSFW           *int            `gorm:"type:integer" json:"nsfw"`
	Meta           *map[string]any `gorm:"type:text;serializer:json" json:"meta"`
	RawMeta        []byte          `gorm:"type:blob" json:"-"`
}
