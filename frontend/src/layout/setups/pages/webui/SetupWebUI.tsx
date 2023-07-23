import { PathSelectInput } from '@/components/PathSelectInput';
import { WebUISetting } from '@/models';
import { Box, Button, Group, ScrollArea, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { usePersistWebUIConfig, useWebUIConfig } from './hooks/useWebUI';

export const SetupWebUI: FC = () => {
  const queryClient = useQueryClient();
  const currentSetting = useWebUIConfig();
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
  const saveWebUIConfig = usePersistWebUIConfig();
  const handleSubmit = useCallback(
    async (values: WebUISetting) => {
      const result = await saveWebUIConfig(values);
      if (result) {
        notifications.show({
          title: '保存成功',
          message: 'SD WebUI设置已保存',
          color: 'green',
          autoClose: 3000,
          withCloseButton: false
        });
        queryClient.invalidateQueries('webui-setting');
      } else {
        notifications.show({
          title: '保存失败',
          message: 'SD WebUI设置保存失败',
          color: 'red',
          autoClose: 3000,
          withCloseButton: false
        });
      }
    },
    [saveWebUIConfig]
  );

  useEffect(() => {
    form.setValues(currentSetting);
  }, [currentSetting]);

  return (
    <Box w="100%" h="100%" px="lg" py="md" sx={{ overflow: 'hidden' }}>
      <ScrollArea h="100%" type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md" align="stretch">
            <PathSelectInput label="WebUI根路径" {...form.getInputProps('basePath')} />
            <PathSelectInput label="大模型(ckpt)目录" {...form.getInputProps('checkpoint')} />
            <PathSelectInput
              label="大模型配置(ckpt配置)目录"
              {...form.getInputProps('configuration')}
            />
            <PathSelectInput label="Lora目录" {...form.getInputProps('lora')} />
            <PathSelectInput label="LyCORIS目录" {...form.getInputProps('locon')} />
            <PathSelectInput label="VAE目录" {...form.getInputProps('vae')} />
            <PathSelectInput label="Embedding目录" {...form.getInputProps('embedding')} />
            <PathSelectInput label="Hypernetwork目录" {...form.getInputProps('hypernet')} />
            <PathSelectInput label="Controlnet目录" {...form.getInputProps('controlnet')} />
            <PathSelectInput label="ESRGAN目录" {...form.getInputProps('esrgan')} />
            <PathSelectInput label="RealESRGAN目录" {...form.getInputProps('realesrgan')} />
            <PathSelectInput label="SwinIR目录" {...form.getInputProps('swinir')} />
            <Group spacing="md" py="sm">
              <Button type="submit" variant="filled">
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </ScrollArea>
    </Box>
  );
};
