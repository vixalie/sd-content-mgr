package entities

import "time"

type CivitaiCreator struct {
	Username string  `json:"username"`
	Image    *string `json:"image"`
}

type Model struct {
	CommonFields
	Id                      int             `gorm:"primaryKey;type:integer" json:"id"`
	Name                    string          `gorm:"type:text" json:"name"`
	Description             *string         `gorm:"type:text" json:"description"`
	Author                  *CivitaiCreator `gorm:"type:text;serializer:json" json:"author"`
	NSFW                    *bool           `gorm:"type:boolean" json:"nsfw"`
	PersonOfInterest        *bool           `gorm:"type:boolean" json:"poi"`
	Type                    string          `gorm:"type:text" json:"type"`
	Mode                    *string         `gorm:"type:text" json:"mode"`
	CivitaiOriginalResponse []byte          `gorm:"type:blob" json:"-"`
	LastSyncedAt            *time.Time      `gorm:"type:datetime" json:"lastSyncedAt"`
	Tags                    []ModelTags     `gorm:"foreignKey:ModelId;references:Id" json:"tags"`
	Versions                []ModelVersion  `gorm:"foreignKey:ModelId;references:Id" json:"versions"`
	CivitailDeleted         bool            `gorm:"type:boolean;default:false" json:"civitaiDeleted"`
}

type ModelVersion struct {
	CommonFields
	Id                      int         `gorm:"primaryKey;type:integer" json:"id"`
	ModelId                 *int        `gorm:"type:integer;index" json:"modelId"`
	Model                   *Model      `gorm:"foreignKey:ModelId;references:Id" json:"model"`
	VersionName             string      `gorm:"type:text" json:"versionName"`
	ActivatePrompt          []string    `gorm:"type:text;serializer:json" json:"activatePrompt"`
	BaseModel               *string     `gorm:"type:text" json:"baseModel"`
	PageUrl                 *string     `gorm:"type:text" json:"pageUrl"`
	DownloadUrl             *string     `gorm:"type:text" json:"-"`
	DownloadedAt            *time.Time  `gorm:"type:datetime" json:"downloadedAt"`
	LastSyncedAt            *time.Time  `gorm:"type:datetime" json:"lastSyncedAt"`
	CoverUsed               *string     `gorm:"type:text" json:"coverUsed"`
	Covers                  []Image     `gorm:"foreignKey:VersionId;references:Id" json:"covers"`
	Gallery                 []string    `gorm:"type:text;serializer:json" json:"gallery"`
	PrimaryFileId           *int64      `gorm:"type:integer;index" json:"-"`
	PrimaryFile             *ModelFile  `gorm:"foreignKey:Id;references:PrimaryFileId" json:"-"`
	Files                   []ModelFile `gorm:"foreignKey:VersionId;references:Id" json:"-"`
	CivitaiOriginalResponse []byte      `gorm:"type:blob" json:"-"`
	CivitaiCreatedAt        *time.Time  `gorm:"type:datetime" json:"civitaiCreatedAt"`
	CivitaiUpdatedAt        *time.Time  `gorm:"type:datetime" json:"civitaiUpdatedAt"`
}

type ModelTags struct {
	ModelId int    `gorm:"primaryKey;type:integer" json:"modelId"`
	Tag     string `gorm:"primaryKey;type:text;index" json:"tag"`
}
