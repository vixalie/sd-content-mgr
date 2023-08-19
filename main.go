package main

import (
	"embed"
	"os"

	"archgrid.xyz/ag/toolsbox/serial_code/hail"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/git"
	"github.com/vixalie/sd-content-manager/models"
	"github.com/vixalie/sd-content-manager/remote"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/net/context"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// 创建应用配置功能
	settings := config.NewApplicationSettings()
	// 创建应用中模型控制功能。
	modelController := models.NewModelController()
	// 创建应用中远程控制功能
	remoteController := remote.NewRemoteController()
	// 创建本地文件加载功能
	fileLoader := NewFileLoader()
	// 创建Git版本库控制功能
	gitController := git.NewGitController()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "SD Content Manager",
		Width:  1280,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: fileLoader,
		},
		LogLevel:           logger.INFO,
		LogLevelProduction: logger.WARNING,
		BackgroundColour:   &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			hail.Initialize(1)
			hailEngine, err := hail.Get()
			if err != nil {
				runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
					Type:    runtime.ErrorDialog,
					Title:   "初始化错误",
					Message: "Hail ID引擎创建失败",
					Buttons: []string{"OK"},
				})
				println("Error:", err.Error())
				os.Exit(1)
			}
			ctx = context.WithValue(ctx, "hail", hailEngine)
			err = db.InitDB(&ctx)
			if err != nil {
				runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
					Type:    runtime.ErrorDialog,
					Title:   "初始化错误",
					Message: "数据库创建失败",
					Buttons: []string{"OK"},
				})
				println("Error:", err.Error())
				os.Exit(1)
			}
			app.startup(ctx)
			settings.SetContext(ctx)
			fileLoader.SetContext(ctx)
			modelController.SetContext(ctx)
			remoteController.SetContext(ctx)
			gitController.SetContext(ctx)
		},
		Bind: []interface{}{
			app,
			settings,
			modelController,
			remoteController,
			gitController,
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
