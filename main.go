package main

import (
	"embed"

	"archgrid.xyz/ag/toolsbox/serial_code/hail"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/models"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
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

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "SD Content Manager",
		Width:            1280,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			hail.Initialize(1)
			app.startup(ctx)
			settings.SetContext(ctx)
			modelController.SetContext(ctx)
		},
		Bind: []interface{}{
			app,
			settings,
			modelController,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
