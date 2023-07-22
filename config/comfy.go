package config

import "gopkg.in/yaml.v3"

type ComfyUIConfig struct {
	BasePath                string `yaml:"base_path"`
	Checkpoint              string `yaml:"checkpoint"`
	Clip                    string `yaml:"clip"`
	ClipVision              string `yaml:"clip_vision"`
	CheckpointConfiguration string `yaml:"configuration"`
	Diffuser                string `yaml:"diffusers"`
	Embedding               string `yaml:"embedding"`
	GLIGAN                  string `yaml:"gligan"`
	Hypernet                string `yaml:"hypernet"`
	Lora                    string `yaml:"lora"`
	LyCORIS                 string `yaml:"locon"`
	Styles                  string `yaml:"styles"`
	UNet                    string `yaml:"unet"`
	Upscaler                string `yaml:"upscaler"`
	Vae                     string `yaml:"vae"`
	ExtraModelPathsFile     string `yaml:"extra_model_paths_file"`
}

type AdaptComfyUIConfig struct {
	BasePath                string `yaml:"base_path"`
	Checkpoint              string `yaml:"checkpoints"`
	CheckpointConfiguration string `yaml:"configs"`
	Vae                     string `yaml:"vae"`
	Loras                   string `yaml:"loras,flow"`
	Upscalers               string `yaml:"upscale_models,flow"`
	Embeddings              string `yaml:"embeddings"`
	Hypernets               string `yaml:"hypernetworks"`
	Controlnet              string `yaml:"controlnet"`
}

type ToComfyUIConfig map[string]AdaptComfyUIConfig

func LoadComfyUIConfig(configContent []byte) *ComfyUIConfig {
	var webUIConfig ComfyUIConfig
	err := yaml.Unmarshal(configContent, &webUIConfig)
	if err != nil {
		return nil
	}
	return &webUIConfig
}
