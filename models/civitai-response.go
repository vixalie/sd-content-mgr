package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type CivitaiCreator struct {
	Username string  `json:"username"`
	Image    *string `json:"image"`
}

type ModelBriefDescription struct {
	Name string  `json:"name"`
	Type string  `json:"type"`
	NSFW bool    `json:"nsfw"`
	POI  bool    `json:"poi"`
	Mode *string `json:"mode"`
}

type ModelFileMeta struct {
	FP     *string `json:"fp,omitempty"`
	Size   *string `json:"size,omitempty"`
	Format *string `json:"format,omitempty"`
}

type ModelFileHashes struct {
	AutoV1 *string `json:"AutoV1,omitempty"`
	AutoV2 *string `json:"AutoV2,omitempty"`
	Sha256 *string `json:"SHA256,omitempty"`
	CRC32  *string `json:"CRC32,omitempty"`
	Blake3 *string `json:"BLAKE3,omitempty"`
}

type ModelFileEntry struct {
	Name             *string          `json:"name"`
	Id               *int             `json:"id"`
	SizeKB           int64            `json:"sizeKB"`
	Type             *string          `json:"type"`
	PickleScanResult string           `json:"pickleScanResult"`
	VirusScanResult  string           `json:"virusScanResult"`
	ScannedAt        *time.Time       `json:"scannedAt"`
	Metadata         *ModelFileMeta   `json:"metadata"`
	Hashes           *ModelFileHashes `json:"hashes"`
	Primary          *bool            `json:"primary"`
	DownloadUrl      *string          `json:"downloadUrl"`
}

type ModelStat struct {
	DownloadCount int             `json:"downloadCount"`
	RatingCount   int             `json:"ratingCount"`
	Rating        decimal.Decimal `json:"rating"`
}

type ModelImage struct {
	Url    string         `json:"url"`
	NSFW   string         `json:"nsfw"`
	Width  int            `json:"width"`
	Height int            `json:"height"`
	Hash   string         `json:"hash"`
	Meta   map[string]any `json:"meta"`
}

type ModelVersion struct {
	Id           int                   `json:"id"`
	Name         string                `json:"name"`
	Description  *string               `json:"description"`
	Model        ModelBriefDescription `json:"model"`
	BaseModel    *string               `json:"baseModel"`
	ModelId      int                   `json:"modelId"`
	CreatedAt    time.Time             `json:"createdAt"`
	DownloadUrl  string                `json:"downloadUrl"`
	TrainedWords []string              `json:"trainedWords"`
	Files        []ModelFileEntry      `json:"files"`
	Stats        ModelStat             `json:"stats"`
	Images       []ModelImage          `json:"images"`
}

type Model struct {
	Id            int            `json:"id"`
	Name          string         `json:"name"`
	Description   *string        `json:"description"`
	Type          string         `json:"type"`
	NSFW          bool           `json:"nsfw"`
	Tags          []string       `json:"tags"`
	Mode          *string        `json:"mode"`
	Creator       CivitaiCreator `json:"creator"`
	ModelVersions []ModelVersion `json:"modelVersions"`
}
