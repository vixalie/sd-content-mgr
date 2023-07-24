import { PathSelectInput } from '@/components/PathSelectInput';
import { ComfyUISettting } from '@/models';
import { Box, Button, Group, ScrollArea, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useClearComfyUIConfig, usePersistComfyUIConfig } from './hooks/useComfyUI';

export const SetupComfyUI: FC = () => {
  const currentSetting = useLoaderData<ComfyUISetting>();
  const form = useForm<ComfyUISettting>({
    initialValues: {
      basePath: currentSetting?.basePath ?? '',
      checkpoint: currentSetting?.checkpoint ?? '',
      configuration: currentSetting?.configuration ?? '',
      clip: currentSetting?.clip ?? '',
      clipVision: currentSetting?.clipVision ?? '',
      diffusers: currentSetting?.diffusers ?? '',
      embedding: currentSetting?.embedding ?? '',
      gligen: currentSetting?.gligen ?? '',
      hypernet: currentSetting?.hypernet ?? '',
      lora: currentSetting?.lora ?? '',
      locon: currentSetting?.locon ?? '',
      styles: currentSetting?.styles ?? '',
      unet: currentSetting?.unet ?? '',
      upscaler: currentSetting?.upscaler ?? '',
      vae: currentSetting?.vae ?? ''
    }
  });
  const handleSubmit = usePersistComfyUIConfig();
  const clearConfig = useClearComfyUIConfig();

  useEffect(() => {
    form.setValues(currentSetting);
  }, [currentSetting]);

  return (
    <Box w="100%" h="100%" px="lg" py="md" sx={{ overflow: 'hidden' }}>
      <ScrollArea h="100%" type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md" align="stretch">
            <PathSelectInput label="ComfyUI根路径" {...form.getInputProps('basePath')} />
            <PathSelectInput label="大模型(ckpt)路径" {...form.getInputProps('checkpoint')} />
            <PathSelectInput
              label="大模型配置(ckpt配置)路径"
              {...form.getInputProps('configuration')}
            />
            <PathSelectInput
              label="CLIP模型路径"
              {...form.getInputProps('clip')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="CLIP Vision模型路径"
              {...form.getInputProps('clipVision')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="Diffusers模型路径"
              {...form.getInputProps('diffusers')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="Embedding模型路径"
              {...form.getInputProps('embedding')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="GLIGEN模型路径"
              {...form.getInputProps('gligen')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="Hypernetwork模型路径"
              {...form.getInputProps('hypernet')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="LORA模型路径"
              {...form.getInputProps('lora')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="LyCORIS模型路径"
              {...form.getInputProps('locon')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="Styles模型路径"
              {...form.getInputProps('styles')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="UNet模型路径"
              {...form.getInputProps('unet')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="Upscaler模型路径"
              {...form.getInputProps('upscaler')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <PathSelectInput
              label="VAE模型路径"
              {...form.getInputProps('vae')}
              basePath={currentSetting?.basePath ?? form.values.basePath ?? ''}
            />
            <Group spacing="md" py="sm">
              <Button type="submit" variant="filled">
                保存
              </Button>
              <Button variant="light" color="red" onClick={clearConfig}>
                清除配置
              </Button>
            </Group>
          </Stack>
        </form>
      </ScrollArea>
    </Box>
  );
};
