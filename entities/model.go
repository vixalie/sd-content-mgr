package entities

import "time"

type CivitaiCreator struct {
	Username string  `json:"username"`
	Image    *string `json:"image"`
}

type Model struct {
	CommonFields
	Id                      int             `gorm:"primaryKey;type:integer"`
	Name                    string          `gorm:"type:text"`
	Description             *string         `gorm:"type:text"`
	Author                  *CivitaiCreator `gorm:"type:text;serializer:json"`
	NSFW                    *bool           `gorm:"type:boolean"`
	PersonOfInterest        *bool           `gorm:"type:boolean"`
	Type                    string          `gorm:"type:text"`
	Mode                    *string         `gorm:"type:text"`
	CivitaiOriginalResponse []byte          `gorm:"type:blob"`
	LastSyncedAt            *time.Time      `gorm:"type:time"`
	Tags                    []ModelTags     `gorm:"foreignKey:ModelId;references:Id"`
	Versions                []ModelVersion  `gorm:"foreignKey:ModelId;references:Id"`
}

type ModelVersion struct {
	CommonFields
	Id                      int         `gorm:"primaryKey;type:integer"`
	ModelId                 *int        `gorm:"type:integer;index"`
	Model                   *Model      `gorm:"foreignKey:ModelId;references:Id"`
	VersionName             string      `gorm:"type:text"`
	ActivatePrompt          []string    `gorm:"type:text;serializer:json"`
	BaseModel               *string     `gorm:"type:text"`
	PageUrl                 *string     `gorm:"type:text"`
	DownloadUrl             *string     `gorm:"type:text"`
	DownloadedAt            *time.Time  `gorm:"type:time"`
	LastSyncedAt            *time.Time  `gorm:"type:time"`
	CoverUsed               *string     `gorm:"type:text"`
	Covers                  []Image     `gorm:"foreignKey:VersionId;references:Id"`
	Gallery                 []string    `gorm:"type:text;serializer:json"`
	PrimaryFileId           *int64      `gorm:"type:integer;index"`
	PrimaryFile             *ModelFile  `gorm:"foreignKey:Id;references:PrimaryFileId"`
	Files                   []ModelFile `gorm:"foreignKey:VersionId;references:Id"`
	CivitaiOriginalResponse []byte      `gorm:"type:blob"`
	CivitaiCreatedAt        *time.Time  `gorm:"type:time"`
	CivitaiUpdatedAt        *time.Time  `gorm:"type:time"`
}

type ModelTags struct {
	ModelId int    `gorm:"primaryKey;type:integer"`
	Tag     string `gorm:"primaryKey;type:text;index"`
}
