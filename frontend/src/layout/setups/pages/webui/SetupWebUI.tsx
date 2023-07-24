import { PathSelectInput } from '@/components/PathSelectInput';
import { WebUISetting } from '@/models';
import { Box, Button, Group, ScrollArea, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useClearWebUIConfig, usePersistWebUIConfig } from './hooks/useWebUI';

export const SetupWebUI: FC = () => {
  const currentSetting = useLoaderData<WebUISetting>();
  const form = useForm<WebUISetting>({
    initialValues: {
      basePath: currentSetting?.basePath ?? '',
      checkpoint: currentSetting?.checkpoint ?? '',
      configuration: currentSetting?.configuration ?? '',
      lora: currentSetting?.lora ?? '',
      locon: currentSetting?.locon ?? '',
      vae: currentSetting?.vae ?? '',
      embedding: currentSetting?.embedding ?? '',
      hypernet: currentSetting?.hypernet ?? '',
      controlnet: currentSetting?.controlnet ?? '',
      esrgan: currentSetting?.esrgan ?? '',
      realesrgan: currentSetting?.realesrgan ?? '',
      swinir: currentSetting?.swinir ?? ''
    }
  });
  const handleSubmit = usePersistWebUIConfig();
  const clearConfig = useClearWebUIConfig();

  useEffect(() => {
    form.setValues(currentSetting);
  }, [currentSetting]);

  return (
    <Box w="100%" h="100%" px="lg" py="md" sx={{ overflow: 'hidden' }}>
      <ScrollArea h="100%" type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md" align="stretch">
            <PathSelectInput label="WebUI根路径" {...form.getInputProps('basePath')} />
            <PathSelectInput
              label="大模型(ckpt)目录"
              {...form.getInputProps('checkpoint')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="大模型配置(ckpt配置)目录"
              {...form.getInputProps('configuration')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="Lora目录"
              {...form.getInputProps('lora')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="LyCORIS目录"
              {...form.getInputProps('locon')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="VAE目录"
              {...form.getInputProps('vae')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="Embedding目录"
              {...form.getInputProps('embedding')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="Hypernetwork目录"
              {...form.getInputProps('hypernet')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="Controlnet目录"
              {...form.getInputProps('controlnet')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="ESRGAN目录"
              {...form.getInputProps('esrgan')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="RealESRGAN目录"
              {...form.getInputProps('realesrgan')}
              basePath={currentSetting?.basePath}
            />
            <PathSelectInput
              label="SwinIR目录"
              {...form.getInputProps('swinir')}
              basePath={currentSetting?.basePath}
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
