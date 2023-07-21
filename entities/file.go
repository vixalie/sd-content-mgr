package entities

type FileCache struct {
	CommonFields
	FileIdentityHash string `gorm:"primaryKey;type:text"`
	FileName         string `gorm:"type:text"`
	FullPath         string `gorm:"type:text;index"`
	RelatedModel     *Model `gorm:"foreignKey:FileIdentityHash;references:FileIdentityHash"`
}
