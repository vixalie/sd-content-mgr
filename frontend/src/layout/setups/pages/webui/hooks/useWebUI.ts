import { WebUISetting } from '@/models';
import { useQuery } from '@tanstack/react-query';
import { GetCurrentWebUIConfig, SaveNewWebUIConfig } from '@wails/go/config/ApplicationSettings';
import { useCallback } from 'react';

export function useWebUIConfig(): WebUISetting {
  const { data } = useQuery({
    queryKey: ['webui-config'],
    queryFn: async () => {
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
  });
  return data;
}

export function usePersistWebUIConfig(): (config: WebUISetting) => Promise<boolean> {
  const persisitHandler = useCallback(async (config: WebUISetting) => {
    return await SaveNewWebUIConfig({
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
  }, []);
  return persisitHandler;
}
