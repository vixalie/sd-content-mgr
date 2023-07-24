import { ComfyUISettting } from '@/models';
import { notifications } from '@mantine/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClearComfyUIConfig,
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

export function usePersistComfyUIConfig(): (config: ComfyUISettting) => Promise<void> {
  const queryClient = useQueryClient();
  const persisitHandler = useCallback(async (config: ComfyUISettting) => {
    const result = await SaveNewComfyUIConfig({
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
    if (result) {
      notifications.show({
        title: '保存成功',
        message: 'SD ComfyUI设置已保存',
        color: 'green',
        autoClose: 3000,
        withCloseButton: false
      });
      queryClient.invalidateQueries('comfyui-config');
    } else {
      notifications.show({
        title: '保存失败',
        message: 'SD ComfyUI设置保存失败',
        color: 'red',
        autoClose: 3000,
        withCloseButton: false
      });
    }
  }, []);
  return persisitHandler;
}

export function useClearComfyUIConfig(): () => Promise<void> {
  const queryClient = useQueryClient();
  const clearHandler = useCallback(async () => {
    const result = await ClearComfyUIConfig();
    if (result) {
      notifications.show({
        title: '清除成功',
        message: 'SD ComfyUI设置已清除',
        color: 'green',
        autoClose: 3000,
        withCloseButton: false
      });
      queryClient.invalidateQueries('comfyui-config');
    } else {
      notifications.show({
        title: '清除失败',
        message: 'SD ComfyUI设置清除失败',
        color: 'red',
        autoClose: 3000,
        withCloseButton: false
      });
    }
  }, []);
  return clearHandler;
}
