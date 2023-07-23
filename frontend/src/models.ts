export interface ProxySetting {
  mode: string;
  protocol: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
}

export interface WebUISetting {
  basePath: string;
  checkpoint: string;
  configuration: string;
  lora: string;
  locon: string;
  vae: string;
  embedding: string;
  hypernet: string;
  controlnet: string;
  esrgan: string;
  realesrgan: string;
  swinir: string;
}

export interface ComfyUISettting {
  basePath: string;
  checkpoint: string;
  checkpointConfig: string;
  clip: string;
  clipVision: string;
  diffusers: string;
  embedding: string;
  gligan: string;
  hypernet: string;
  lora: string;
  locon: string;
  styles: string;
  unet: string;
  upscaler: string;
  vae: string;
}
