package entities

import "time"

type Model struct {
	CommonFields
	Id                      string      `gorm:"primaryKey;type:text"`
	ModelName               string      `gorm:"type:text"`
	Description             *string     `gorm:"type:text"`
	AuthorId                *string     `gorm:"type:text"`
	Author                  *string     `gorm:"type:text"`
	NSFW                    *bool       `gorm:"type:boolean"`
	PersonOfInterest        *bool       `gorm:"type:boolean"`
	Tags                    []ModelTags `gorm:"foreignKey:ModelId;references:Id"`
	CivitaiModelId          *int        `gorm:"type:integer"`
	CivitaiOriginalResponse []byte      `gorm:"type:blob"`
}

type ModelVersion struct {
	CommonFields
	VersionId               string     `gorm:"primaryKey;type:text"`
	VersionName             string     `gorm:"type:text"`
	ActivatePrompt          []string   `gorm:"type:text;serializer:json"`
	ModelHash               *string    `gorm:"type:text;unique"`
	ModelCRC32              *uint32    `gorm:"type:integer"`
	FileIdentityHash        *string    `gorm:"type:text;unique"`
	FileCRC32               *uint32    `gorm:"type:integer"`
	FileName                *string    `gorm:"type:text"`
	BaseModel               *string    `gorm:"type:text"`
	Size                    *uint64    `gorm:"type:integer"`
	Type                    int        `gorm:"type:integer"`
	Precision               *int       `gorm:"type:integer"`
	PageUrl                 *string    `gorm:"type:text"`
	DownloadUrl             *string    `gorm:"type:text"`
	DirectDownloadUrl       *string    `gorm:"type:text"`
	DownloadedAt            *time.Time `gorm:"type:time"`
	LastSyncedAt            *time.Time `gorm:"type:time"`
	CoverUsed               *string    `gorm:"type:text"`
	Covers                  []string   `gorm:"type:text;serializer:json"`
	Gallery                 []string   `gorm:"type:text;serializer:json"`
	CivitaiVersionId        *int       `gorm:"type:integer"`
	CivitaiFileId           *int       `gorm:"type:integer"`
	CivitaiOriginalFileName *string    `gorm:"type:text"`
	CivitaiOriginalResponse []byte     `gorm:"type:blob"`
	CivitaiCreatedAt        *time.Time `gorm:"type:time"`
	CivitaiUpdatedAt        *time.Time `gorm:"type:time"`
}

type ModelTags struct {
	ModelId string `gorm:"primaryKey;type:text"`
	Tag     string `gorm:"primaryKey;type:text"`
}
