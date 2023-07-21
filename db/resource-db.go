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
	db, err := gorm.Open(sqlite.Open("sdres.db"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return err
	}
	db.AutoMigrate(
		&entities.Model{},
		&entities.ModelVersion{},
		&entities.ModelTags{},
		&entities.Image{},
		&entities.FileCache{},
	)
	*ctx = context.WithValue(*ctx, DBConnection, db)
	return nil
}
