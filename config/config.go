package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/mitchellh/go-homedir"
	"gopkg.in/yaml.v3"
)

type UIName string

const (
	WebUI   UIName = "webui"
	ComfyUI UIName = "comfyui"
)

type Configuration struct {
	Behaviours    *AppBehaviours                  `yaml:"behaviours"`
	ComfyUIConfig *ComfyUIConfig                  `yaml:"comfy_ui"`
	ProxyConfig   *ProxyConfig                    `yaml:"proxy"`
	WebUIConfig   *A111StableDiffusionWebUIConfig `yaml:"a111_web_ui"`
}

var (
	ApplicationSetup *Configuration = nil
	SettingPath      string
)

func LoadConfiguration() *Configuration {
	configFilePath := filepath.Join(SettingPath, "config.yaml")
	configContent, err := os.ReadFile(configFilePath)
	if err != nil {
		return nil
	}
	var configuration Configuration
	err = yaml.Unmarshal(configContent, &configuration)
	if err != nil {
		return nil
	}
	return &configuration
}

func (c *Configuration) Save() error {
	configFilePath := filepath.Join(SettingPath, "config.yaml")
	configContent, err := yaml.Marshal(c)
	if err != nil {
		return err
	}
	err = os.WriteFile(configFilePath, configContent, 0644)
	if err != nil {
		return err
	}
	return nil
}

func (c *Configuration) CommonPaths() map[UIName]map[string]string {
	return map[UIName]map[string]string{
		WebUI: {
			"base":       c.WebUIConfig.BasePath,
			"checkpoint": c.WebUIConfig.Checkpoint,
			"hypernet":   c.WebUIConfig.Hypernet,
			"embedding":  c.WebUIConfig.Embedding,
			"lora":       c.WebUIConfig.Lora,
			"locon":      c.WebUIConfig.LyCORIS,
			"vae":        c.WebUIConfig.Vae,
			"controlnet": c.WebUIConfig.Controlnet,
			"upscaler":   c.WebUIConfig.ESRGAN,
		},
		ComfyUI: {
			"base":       c.ComfyUIConfig.BasePath,
			"checkpoint": c.ComfyUIConfig.Checkpoint,
			"hypernet":   c.ComfyUIConfig.Hypernet,
			"embedding":  c.ComfyUIConfig.Embedding,
			"lora":       c.ComfyUIConfig.Lora,
			"locon":      c.ComfyUIConfig.LyCORIS,
			"vae":        c.ComfyUIConfig.Vae,
			"controlnet": c.ComfyUIConfig.Controlnet,
			"upscaler":   c.ComfyUIConfig.Upscaler,
		},
	}
}

func init() {
	userHomeDir, err := homedir.Dir()
	if err != nil {
		SettingPath = "./.sdmgr"
	} else {
		SettingPath = filepath.Join(userHomeDir, ".sdmgr")
	}
	if err = os.MkdirAll(SettingPath, os.ModePerm); err != nil {
		fmt.Printf("创建配置文件夹失败，使用应用所在文件夹代替， %s\n", err.Error())
		SettingPath = "./"
	}
	configFilePath := filepath.Join(SettingPath, "config.yaml")
	_, err = os.Stat(configFilePath)
	if os.IsNotExist(err) {
		ApplicationSetup = &Configuration{}
		ApplicationSetup.Save()
		return
	}
	ApplicationSetup = LoadConfiguration()
}

func MatchSoftware(soft string) UIName {
	switch strings.ToLower(soft) {
	case "a111":
		fallthrough
	case "webui":
		return WebUI
	case "comfyui":
		return ComfyUI
	default:
		return WebUI
	}
}

func GetWebUIModelPath(model string) ([]string, error) {
	if ApplicationSetup.WebUIConfig == nil {
		return nil, errors.New("SD WebUI的模型路径尚未配置。")
	}
	switch strings.ToLower(model) {
	case "ckpt":
		fallthrough
	case "checkpoint":
		return []string{ApplicationSetup.WebUIConfig.Checkpoint}, nil
	case "hypernet":
		return []string{ApplicationSetup.WebUIConfig.Hypernet}, nil
	case "texture":
		return []string{ApplicationSetup.WebUIConfig.Embedding}, nil
	case "lora":
		return []string{ApplicationSetup.WebUIConfig.Lora}, nil
	case "locon":
		return []string{ApplicationSetup.WebUIConfig.LyCORIS}, nil
	case "vae":
		return []string{ApplicationSetup.WebUIConfig.Vae}, nil
	case "controlnet":
		return []string{ApplicationSetup.WebUIConfig.Controlnet}, nil
	case "upscaler":
		return []string{
			ApplicationSetup.WebUIConfig.ESRGAN,
			ApplicationSetup.WebUIConfig.RealESRGAN,
			ApplicationSetup.WebUIConfig.SwinIR,
		}, nil
	default:
		return nil, errors.New("未定义的模型类型")
	}
}

func GetComfyModelPath(model string) ([]string, error) {
	if ApplicationSetup.ComfyUIConfig == nil {
		return nil, errors.New("SD ComfyUI的模型路径尚未配置。")
	}
	switch strings.ToLower(model) {
	case "ckpt":
		fallthrough
	case "checkpoint":
		return []string{ApplicationSetup.ComfyUIConfig.Checkpoint}, nil
	case "hypernet":
		return []string{ApplicationSetup.ComfyUIConfig.Hypernet}, nil
	case "texture":
		return []string{ApplicationSetup.ComfyUIConfig.Embedding}, nil
	case "lora":
		fallthrough
	case "locon":
		return []string{ApplicationSetup.ComfyUIConfig.Lora}, nil
	case "vae":
		return []string{ApplicationSetup.ComfyUIConfig.Vae}, nil
	case "controlnet":
		return []string{ApplicationSetup.ComfyUIConfig.Controlnet}, nil
	case "upscaler":
		return []string{ApplicationSetup.ComfyUIConfig.Upscaler}, nil
	default:
		return nil, errors.New("未定义的模型类型")
	}
}

func GetProxyUrl() *url.URL {
	if ApplicationSetup.ProxyConfig == nil || !ApplicationSetup.ProxyConfig.UseProxy {
		return nil
	}
	var host string
	if ApplicationSetup.ProxyConfig.Port == nil {
		host = ApplicationSetup.ProxyConfig.Host
	} else {
		host = fmt.Sprintf("%s:%d", ApplicationSetup.ProxyConfig.Host, *ApplicationSetup.ProxyConfig.Port)
	}
	proxyUrl := url.URL{
		Scheme: string(ApplicationSetup.ProxyConfig.Protocol),
		Host:   host,
	}
	if ApplicationSetup.ProxyConfig.User != nil {
		proxyUrl.User = url.UserPassword(*ApplicationSetup.ProxyConfig.User, ApplicationSetup.ProxyConfig.GetPassword())
	}
	return &proxyUrl
}
