package entities

type FileCache struct {
	CommonFields
	FileIdentityHash string `gorm:"primaryKey;type:text"`
	FileName         string `gorm:"type:text"`
	FullPath         string `gorm:"type:text;index"`
	Size             uint64 `gorm:"type:integer"`
	CRC32            uint32 `gorm:"type:integer"`
	RelatedModel     *Model `gorm:"foreignKey:FileIdentityHash;references:FileIdentityHash"`
}
