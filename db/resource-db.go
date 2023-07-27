package db

import (
	"context"
	"os"

	"github.com/glebarez/sqlite"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type dbConnection string

const DBConnection dbConnection = "db"

var CacheDB *gorm.DB

func init() {
	CacheDB, err := gorm.Open(sqlite.Open("sdres.db"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		runtime.MessageDialog(context.TODO(), runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "初始化错误",
			Message: "数据库创建失败",
			Buttons: []string{"OK"},
		})
		println("Error:", err.Error())
		os.Exit(1)
	}
	CacheDB.AutoMigrate(
		&entities.Model{},
		&entities.ModelVersion{},
		&entities.ModelTags{},
		&entities.ModelFile{},
		&entities.Image{},
		&entities.FileCache{},
	)
}
