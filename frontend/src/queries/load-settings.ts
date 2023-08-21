import {
  GetCurrentAppBehaviours,
  GetCurrentComfyUIConfig,
  GetCurrentWebUIConfig
} from '@wails/go/config/ApplicationSettings';
import { AllWebUIExtensions } from '@wails/go/git/GitController';
import { config } from '@wails/go/models';

export async function loadWebUISettings(): Promise<config.A111StableDiffusionWebUIConfig> {
  return await GetCurrentWebUIConfig();
}

export async function loadComfyUISettings(): Promise<config.ComfyUIConfig> {
  return await GetCurrentComfyUIConfig();
}

export async function loadWebUIExtensions(): Promise<Record<string, string>> {
  return await AllWebUIExtensions();
}

export async function loadAppBehaviours(): Promise<config.AppBehaviours> {
  return await GetCurrentAppBehaviours();
}
