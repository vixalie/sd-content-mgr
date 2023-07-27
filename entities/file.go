package entities

type FileCache struct {
	CommonFields
	FullPath              string        `gorm:"primaryKey;type:text"`
	FileIdentityHash      string        `gorm:"type:text;index"` // 使用对文件计算的Sha256值的大写Hex形式作为文件的唯一标识符。
	FileName              string        `gorm:"type:text"`
	ThumbnailPath         *string       `gorm:"type:text"`
	CivitaiInfoPath       *string       `gorm:"type:text"`    // 如果本项目不为空，那么模型一定存在详细信息。
	Size                  uint64        `gorm:"type:integer"` // 字节数量
	CRC32                 string        `gorm:"type:text"`    // 注意位序，这里似乎应该是使用小端序
	RelatedModelFile      *ModelFile    `gorm:"foreignKey:FileIdentityHash;references:IdentityHash"`
	RelatedModelVersionId *int          `gorm:"type:integer;index"`
	RelatedModel          *ModelVersion `gorm:"foreignKey:RelatedModelVersionId;references:Id"`
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

type ModelFile struct {
	CommonFields
	Id           int64            `gorm:"primaryKey;type:integer"`
	VersionId    int              `gorm:"type:integer;index"`
	Version      *ModelVersion    `gorm:"foreignKey:VersionId;references:Id"`
	Name         string           `gorm:"type:text"`
	Size         uint64           `gorm:"type:integer"`
	Type         *string          `gorm:"type:text"`
	IdentityHash string           `gorm:"type:text;index"`
	Metadata     *ModelFileMeta   `gorm:"type:text;serializer:json"`
	Hashes       *ModelFileHashes `gorm:"type:text;serializer:json"`
	Primary      *bool            `gorm:"type:boolean"`
	DownloadUrl  *string          `gorm:"type:text"`
	LocalFile    *FileCache       `gorm:"foreignKey:FileIdentityHash;references:IdentityHash"`
}
