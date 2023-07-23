import { ComfyUISettting } from '@/models';
import { useQuery } from '@tanstack/react-query';
import {
  GetCurrentComfyUIConfig,
  SaveNewComfyUIConfig
} from '@wails/go/config/ApplicationSettings';
import { useCallback } from 'react';

export function useComfyUIConfig(): ComfyUISettting | null | undefined {
  const { data } = useQuery({
    queryKey: ['comfyui-config'],
    queryFn: async (): Promise<ComfyUISettting> => {
      const data = await GetCurrentComfyUIConfig();
      return {
        basePath: data?.basePath ?? '',
        checkpoint: data?.checkpoint ?? '',
        configuration: data?.configuration ?? '',
        clip: data?.clip ?? '',
        clipVision: data?.clipVision ?? '',
        diffusers: data?.diffuser ?? '',
        embedding: data?.embedding ?? '',
        gligen: data?.gligen ?? '',
        hypernet: data?.hypernet ?? '',
        lora: data?.lora ?? '',
        locon: data?.locon ?? '',
        styles: data?.styles ?? '',
        unet: data?.unet ?? '',
        upscaler: data?.upscaler ?? '',
        vae: data?.vae ?? ''
      };
    }
  });
  return data;
}

export function usePersistComfyUIConfig(): (config: ComfyUISettting) => Promise<boolean> {
  const persisitHandler = useCallback(async (config: ComfyUISettting) => {
    return await SaveNewComfyUIConfig({
      basePath: config.basePath,
      checkpoint: config.checkpoint,
      configuration: config.configuration,
      clip: config.clip,
      clipVision: config.clipVision,
      diffuser: config.diffusers,
      embedding: config.embedding,
      gligen: config.gligen,
      hypernet: config.hypernet,
      lora: config.lora,
      locon: config.locon,
      styles: config.styles,
      unet: config.unet,
      upscaler: config.upscaler,
      vae: config.vae,
      extraModelPathsFile: 'extra_model_paths.yaml'
    });
  }, []);
  return persisitHandler;
}
