package config

import "gopkg.in/yaml.v3"

type AppBehaviours struct {
	TreatLoconAsLora bool `yaml:"treat_locon_as_lora" json:"treatLoconAsLora"`
}

func LoadAppBehaviours(configContent []byte) *AppBehaviours {
	var behaviours AppBehaviours
	err := yaml.Unmarshal(configContent, &behaviours)
	if err != nil {
		return nil
	}
	return &behaviours
}
