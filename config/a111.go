package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type A111StableDiffusionWebUIConfig struct {
	BasePath      string `yaml:"base_path"`
	Checkpoint    string `yaml:"checkpoint"`
	Configuration string `yaml:"configuration"`
	Lora          string `yaml:"lora"`
	LyCORIS       string `yaml:"locon"`
	Vae           string `yaml:"vae"`
	Embedding     string `yaml:"embedding"`
	Hypernet      string `yaml:"hypernet"`
	Controlnet    string `yaml:"controlnet"`
	ESRGAN        string `yaml:"esrgan"`
	RealESRGAN    string `yaml:"real_esrgan"`
	SwinIR        string `yaml:"swinir"`
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
