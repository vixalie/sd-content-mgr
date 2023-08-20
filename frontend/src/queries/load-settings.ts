import {
  GetCurrentComfyUIConfig,
  GetCurrentWebUIConfig
} from '@wails/go/config/ApplicationSettings';
import { config } from '@wails/go/models';

export async function loadWebUISettings(): Promise<config.A111StableDiffusionWebUIConfig> {
  return await GetCurrentWebUIConfig();
}

export async function loadComfyUISettings(): Promise<config.ComfyUIConfig> {
  return await GetCurrentComfyUIConfig();
}
