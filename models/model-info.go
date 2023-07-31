package models

import (
	"context"

	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"gorm.io/gorm"
)

type SimplifiedModelVersion struct {
	Id          int    `gorm:"primaryKey;type:integer" json:"id"`
	VersionName string `gorm:"type:text" json:"versionName"`
}

func fetchSimplifiedModelVersions(ctx context.Context, modelVersionId int) ([]SimplifiedModelVersion, error) {
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	var modelVersion entities.ModelVersion
	result := dbConn.Joins("Model").First(&modelVersion, modelVersionId)
	if result.Error != nil {
		return nil, result.Error
	}
	relatedModelVersions := lo.Map(modelVersion.Model.Versions, func(version entities.ModelVersion, _ int) SimplifiedModelVersion {
		return SimplifiedModelVersion{
			Id:          version.Id,
			VersionName: version.VersionName,
		}
	})
	return relatedModelVersions, result.Error
}
