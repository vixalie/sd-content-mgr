package entities

type FileCache struct {
	CommonFields
	Id                    string        `gorm:"primaryKey;type:text" json:"id"`
	FullPath              string        `gorm:"type:text;index:path_index" json:"fullPath"`
	FileIdentityHash      string        `gorm:"type:text;index:hash_index" json:"fileHash"` // 使用对文件计算的Sha256值的大写Hex形式作为文件的唯一标识符。
	FileName              string        `gorm:"type:text" json:"fileName"`
	ThumbnailPath         *string       `gorm:"type:text" json:"thumbnailPath"`
	ThumbnailPHash        *string       `gorm:"type:text" json:"thumbnailPHash"`
	CivitaiInfoPath       *string       `gorm:"type:text" json:"infoPath"`    // 如果本项目不为空，那么模型一定存在详细信息。
	Size                  uint64        `gorm:"type:integer" json:"fileSize"` // 字节数量
	CRC32                 string        `gorm:"type:text" json:"crc"`         // 注意位序，这里似乎应该是使用小端序
	Memo                  *string       `gorm:"type:text" json:"memo"`
	AdditionalPrompts     []string      `gorm:"type:text;serializer:json" json:"additionalPrompts"`
	BaseModel             *string       `gorm:"type:text" json:"baseModel"` // 这一项仅在文件不对应任何模型的时候才器作用，仅作为记录功能使用。
	RelatedModelFile      *ModelFile    `gorm:"foreignKey:FileIdentityHash;references:IdentityHash" json:"-"`
	RelatedModelVersionId *int          `gorm:"type:integer;index:model_version_index" json:"relatedModelVersionId"`
	RelatedModel          *ModelVersion `gorm:"foreignKey:RelatedModelVersionId;references:Id" json:"relatedModel"`
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
	Id           int64            `gorm:"primaryKey;type:integer" json:"id"`
	VersionId    int              `gorm:"type:integer;index:model_version_index" json:"versionId"`
	Version      *ModelVersion    `gorm:"foreignKey:VersionId;references:Id" json:"modelVersion"`
	Name         string           `gorm:"type:text" json:"name"`
	Size         uint64           `gorm:"type:integer" json:"size"`
	Type         *string          `gorm:"type:text" json:"type"`
	IdentityHash string           `gorm:"type:text;uniqueIndex:file_indentity" json:"identityHash"`
	Metadata     *ModelFileMeta   `gorm:"type:text;serializer:json" json:"metadata"`
	Hashes       *ModelFileHashes `gorm:"type:text;serializer:json" json:"hashes"`
	Primary      *bool            `gorm:"type:boolean" json:"primary"`
	DownloadUrl  *string          `gorm:"type:text" json:"-"`
	LocalFile    *FileCache       `gorm:"foreignKey:FileIdentityHash;references:IdentityHash" json:"localFile"`
}
