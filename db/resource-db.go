package db

import (
	"context"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"github.com/vixalie/sd-content-manager/v2/config"
	"github.com/vixalie/sd-content-manager/v2/entities"
	"gorm.io/gorm"
)

type dbConnection string

const DBConnection dbConnection = "db"

func InitDB(ctx *context.Context) error {
	dbPath := filepath.Join(config.SettingPath, "sdres.db")
	CacheDB, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
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
