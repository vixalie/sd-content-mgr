package config

import (
	"context"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ApplicationSettings struct {
	ctx context.Context
}

func NewApplicationSettings() *ApplicationSettings {
	return &ApplicationSettings{}
}

func (a *ApplicationSettings) SetContext(ctx context.Context) {
	a.ctx = ctx
}

func (a ApplicationSettings) GetProxyServiceProtocols() map[string]string {
	return AvailableProxyProtocols()
}

func (a ApplicationSettings) GetCurrentProxySetting() *ProxyConfig {
	if ApplicationSetup == nil {
		return nil
	}
	oldPass := ApplicationSetup.ProxyConfig.GetPassword()
	return &ProxyConfig{
		UseProxy: ApplicationSetup.ProxyConfig.UseProxy,
		Protocol: ApplicationSetup.ProxyConfig.Protocol,
		Host:     ApplicationSetup.ProxyConfig.Host,
		Port:     ApplicationSetup.ProxyConfig.Port,
		User:     ApplicationSetup.ProxyConfig.User,
		Password: &oldPass,
	}
}

func (a ApplicationSettings) SaveNewProxySetting(use bool, protocol string, host string, port int, usernamem, password string) bool {
	if ApplicationSetup == nil {
		return false
	}
	ApplicationSetup.ProxyConfig = &ProxyConfig{
		UseProxy: use,
		Protocol: ProxyProtocol(protocol),
		Host:     host,
		Port:     &port,
		User:     &usernamem,
	}
	if password != "" {
		err := ApplicationSetup.ProxyConfig.SetPassword(password)
		if err != nil {
			return false
		}
	}
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}

func (a ApplicationSettings) IsPathValid(path string) bool {
	// join webui base path
	if ApplicationSetup.WebUIConfig != nil && ApplicationSetup.WebUIConfig.BasePath != "" {
		path := filepath.Join(ApplicationSetup.WebUIConfig.BasePath, path)
		_, err := os.Stat(path)
		if os.IsExist(err) {
			return true
		}
	}
	// join comfyui base path
	if ApplicationSetup.ComfyUIConfig != nil && ApplicationSetup.ComfyUIConfig.BasePath != "" {
		path := filepath.Join(ApplicationSetup.ComfyUIConfig.BasePath, path)
		_, err := os.Stat(path)
		if os.IsExist(err) {
			return true
		}
	}
	// check absolute path
	_, err := os.Stat(path)
	return os.IsExist(err)
}

func (a ApplicationSettings) SelectOneDirectory(basePath *string) string {
	var defaultDirectory string
	if basePath != nil {
		defaultDirectory = *basePath
	} else {
		defaultDirectory = "."
	}
	directory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                      "选择一个文件夹",
		DefaultDirectory:           defaultDirectory,
		ShowHiddenFiles:            false,
		CanCreateDirectories:       false,
		TreatPackagesAsDirectories: false,
	})
	if err != nil {
		return ""
	}
	return directory
}

func (a ApplicationSettings) GetCurrentWebUIConfig() *A111StableDiffusionWebUIConfig {
	if ApplicationSetup == nil {
		return nil
	}
	return ApplicationSetup.WebUIConfig
}

func (a ApplicationSettings) SaveNewWebUIConfig(config A111StableDiffusionWebUIConfig) bool {
	ApplicationSetup.WebUIConfig = &config
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}

func (a ApplicationSettings) ClearWebUIConfig() bool {
	ApplicationSetup.WebUIConfig = nil
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}

func (a ApplicationSettings) GetCurrentComfyUIConfig() *ComfyUIConfig {
	if ApplicationSetup == nil {
		return nil
	}
	return ApplicationSetup.ComfyUIConfig
}

func (a ApplicationSettings) SaveNewComfyUIConfig(config ComfyUIConfig) bool {
	ApplicationSetup.ComfyUIConfig = &config
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}

func (a ApplicationSettings) ClearComfyUIConfig() bool {
	ApplicationSetup.ComfyUIConfig = nil
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}
