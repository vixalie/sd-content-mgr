package entities

import "time"

type Model struct {
	CommonFields
	Id                      string      `gorm:"primaryKey;type:text"`
	SerialName              string      `gorm:"type:text"`
	Name                    string      `gorm:"type:text"`
	Description             *string     `gorm:"type:text"`
	ActivatePrompt          []string    `gorm:"type:text;serializer:json"`
	Author                  *string     `gorm:"type:text"`
	PublishedAt             *time.Time  `gorm:"type:time"`
	NSFW                    *bool       `gorm:"type:boolean"`
	ModelHash               *string     `gorm:"type:text"`
	ModelCRC32              *uint32     `gorm:"type:integer"`
	FileIdentityHash        *string     `gorm:"type:text"`
	FileCRC32               *uint32     `gorm:"type:integer"`
	Version                 *string     `gorm:"type:text"`
	FileName                *string     `gorm:"type:text"`
	BaseModel               *string     `gorm:"type:text"`
	Size                    *uint64     `gorm:"type:integer"`
	Type                    int         `gorm:"type:integer"`
	Precision               *int        `gorm:"type:integer"`
	PageUrl                 *string     `gorm:"type:text"`
	DownloadUrl             *string     `gorm:"type:text"`
	DownloadedAt            *time.Time  `gorm:"type:time"`
	LastSyncedAt            *time.Time  `gorm:"type:time"`
	CoverUsed               *string     `gorm:"type:text"`
	Covers                  []string    `gorm:"type:text;serializer:json"`
	Exmaples                []string    `gorm:"type:text;serializer:json"`
	Tags                    []ModelTags `gorm:"foreignKey:ModelId;references:Id"`
	CivitaiModelId          *string     `gorm:"type:text"`
	CivitaiOriginalFileName *string     `gorm:"type:text"`
	CivitaiOriginalInfo     *string     `gorm:"type:text"`
}

type ModelTags struct {
	ModelId string `gorm:"primaryKey;type:text"`
	Tag     string `gorm:"primaryKey;type:text"`
}
