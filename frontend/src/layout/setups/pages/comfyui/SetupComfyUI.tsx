import { PathSelectInput } from '@/components/PathSelectInput';
import { ComfyUISettting } from '@/models';
import { Box, Button, Group, ScrollArea, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useComfyUIConfig, usePersistComfyUIConfig } from './hooks/useComfyUI';

export const SetupComfyUI: FC = () => {
  const queryClient = useQueryClient();
  const currentSetting = useComfyUIConfig();
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
  const saveComfyUIConfig = usePersistComfyUIConfig();
  const handleSubmit = useCallback(
    async (values: ComfyUISettting) => {
      const result = await saveComfyUIConfig(values);
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
    },
    [saveComfyUIConfig]
  );

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
              <Button variant="light" color="red">
                清除配置
              </Button>
            </Group>
          </Stack>
        </form>
      </ScrollArea>
    </Box>
  );
};
