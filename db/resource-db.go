package db

import (
	"context"

	"github.com/glebarez/sqlite"
	"github.com/vixalie/sd-content-manager/entities"
	"gorm.io/gorm"
)

type dbConnection string

const DBConnection dbConnection = "db"

func InitDB(ctx *context.Context) error {
	CacheDB, err := gorm.Open(sqlite.Open("sdres.db"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return err
	}
	CacheDB.AutoMigrate(
		&entities.Model{},
		&entities.ModelVersion{},
		&entities.ModelTags{},
		&entities.ModelFile{},
		&entities.Image{},
		&entities.FileCache{},
	)
	*ctx = context.WithValue(*ctx, DBConnection, CacheDB)
	return nil
}
