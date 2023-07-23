package config

import "gopkg.in/yaml.v3"

type ComfyUIConfig struct {
	BasePath                string `yaml:"base_path" json:"basePath"`
	Checkpoint              string `yaml:"checkpoint" json:"checkpoint"`
	Clip                    string `yaml:"clip" json:"clip"`
	ClipVision              string `yaml:"clip_vision" json:"clipVision"`
	CheckpointConfiguration string `yaml:"configuration" json:"configuration"`
	Diffuser                string `yaml:"diffusers" json:"diffuser"`
	Embedding               string `yaml:"embedding" json:"embedding"`
	GLIGEN                  string `yaml:"gligen" json:"gligen"`
	Hypernet                string `yaml:"hypernet" json:"hypernet"`
	Lora                    string `yaml:"lora" json:"lora"`
	LyCORIS                 string `yaml:"locon" json:"locon"`
	Styles                  string `yaml:"styles" json:"styles"`
	UNet                    string `yaml:"unet" json:"unet"`
	Upscaler                string `yaml:"upscaler" json:"upscaler"`
	Vae                     string `yaml:"vae" json:"vae"`
	ExtraModelPathsFile     string `yaml:"extra_model_paths_file" json:"extraModelPathsFile"`
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
