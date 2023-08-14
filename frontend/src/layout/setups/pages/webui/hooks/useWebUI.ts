import { WebUISetting } from '@/models';
import { notifications } from '@mantine/notifications';
import {
  ClearWebUIConfig,
  GetCurrentWebUIConfig,
  SaveNewWebUIConfig
} from '@wails/go/config/ApplicationSettings';
import { useCallback } from 'react';
import { useRevalidator } from 'react-router-dom';

export async function loadWebUIConfig(): Promise<WebUISetting> {
  const data = await GetCurrentWebUIConfig();
  return {
    basePath: data?.basePath ?? '',
    checkpoint: data?.checkpoint ?? '',
    configuration: data?.configuration ?? '',
    lora: data?.lora ?? '',
    locon: data?.locon ?? '',
    vae: data?.vae ?? '',
    embedding: data?.embedding ?? '',
    hypernet: data?.hypernet ?? '',
    controlnet: data?.controlnet ?? '',
    esrgan: data?.esrgan ?? '',
    realesrgan: data?.realEsrgan ?? '',
    swinir: data?.swinIR ?? ''
  };
}

export function usePersistWebUIConfig(): (config: WebUISetting) => Promise<void> {
  const revalidator = useRevalidator();
  const persisitHandler = useCallback(async (config: WebUISetting) => {
    const result = await SaveNewWebUIConfig({
      basePath: config.basePath,
      checkpoint: config.checkpoint,
      configuration: config.configuration,
      lora: config.lora,
      locon: config.locon,
      vae: config.vae,
      embedding: config.embedding,
      hypernet: config.hypernet,
      controlnet: config.controlnet,
      esrgan: config.esrgan,
      realEsrgan: config.realesrgan,
      swinIR: config.swinir
    });
    if (result) {
      notifications.show({
        title: '保存成功',
        message: 'SD WebUI设置已保存',
        color: 'green',
        withCloseButton: false
      });
      revalidator.revalidate();
    } else {
      notifications.show({
        title: '保存失败',
        message: 'SD WebUI设置保存失败',
        color: 'red',
        withCloseButton: false
      });
    }
  }, []);
  return persisitHandler;
}

export function useClearWebUIConfig(): () => Promise<void> {
  const revalidator = useRevalidator();
  const clearHandler = useCallback(async () => {
    const result = await ClearWebUIConfig();
    if (result) {
      notifications.show({
        title: '清除成功',
        message: 'SD WebUI设置已清除',
        color: 'green',
        withCloseButton: false
      });
      revalidator.revalidate();
    } else {
      notifications.show({
        title: '清除失败',
        message: 'SD WebUI设置清除失败',
        color: 'red',
        withCloseButton: false
      });
    }
  }, []);
  return clearHandler;
}
