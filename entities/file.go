package entities

type FileCache struct {
	CommonFields
	FileIdentityHash string        `gorm:"primaryKey;type:text"`
	FileName         string        `gorm:"type:text"`
	FullPath         string        `gorm:"type:text;index"`
	ThumbnailPath    string        `gorm:"type:text"`
	CivitaiInfoPath  string        `gorm:"type:text"`
	Size             uint64        `gorm:"type:integer"`
	CRC32            uint32        `gorm:"type:integer"`
	RelatedModel     *ModelVersion `gorm:"foreignKey:FileIdentityHash;references:FileIdentityHash"`
}
