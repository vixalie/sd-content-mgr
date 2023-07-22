package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Configuration struct {
	ComfyUIConfig *ComfyUIConfig                  `yaml:"comfy_ui"`
	ProxyConfig   *ProxyConfig                    `yaml:"proxy"`
	WebUIConfig   *A111StableDiffusionWebUIConfig `yaml:"a111_web_ui"`
}

var ApplicationSetup *Configuration = nil

func LoadConfiguration() *Configuration {
	configContent, err := os.ReadFile("config.yaml")
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
	configContent, err := yaml.Marshal(c)
	if err != nil {
		return err
	}
	err = os.WriteFile("config.yaml", configContent, 0644)
	if err != nil {
		return err
	}
	return nil
}

func init() {
	_, err := os.Stat("config.yaml")
	if os.IsNotExist(err) {
		ApplicationSetup = &Configuration{}
		ApplicationSetup.Save()
		return
	}
	ApplicationSetup = LoadConfiguration()
}
