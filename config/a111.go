package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type A111StableDiffusionWebUIConfig struct {
	BasePath      string `yaml:"base_path" json:"basePath"`
	Checkpoint    string `yaml:"checkpoint" json:"checkpoint"`
	Configuration string `yaml:"configuration" json:"configuration"`
	Lora          string `yaml:"lora" json:"lora"`
	LyCORIS       string `yaml:"locon" json:"locon"`
	Vae           string `yaml:"vae" json:"vae"`
	Embedding     string `yaml:"embedding" json:"embedding"`
	Hypernet      string `yaml:"hypernet" json:"hypernet"`
	Controlnet    string `yaml:"controlnet" json:"controlnet"`
	ESRGAN        string `yaml:"esrgan" json:"esrgan"`
	RealESRGAN    string `yaml:"real_esrgan" json:"realEsrgan"`
	SwinIR        string `yaml:"swinir" json:"swinIR"`
}

func LoadWebUIConfig(configContent []byte) *A111StableDiffusionWebUIConfig {
	var webUIConfig A111StableDiffusionWebUIConfig
	err := yaml.Unmarshal(configContent, &webUIConfig)
	if err != nil {
		return nil
	}
	return &webUIConfig
}

func (c A111StableDiffusionWebUIConfig) IsBasePathAvailable() bool {
	_, err := os.Stat(c.BasePath)
	if err != nil {
		return false
	}
	return os.IsExist(err)
}
