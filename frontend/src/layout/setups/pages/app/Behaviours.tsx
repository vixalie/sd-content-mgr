import { Box, Button, Group, ScrollArea, Stack, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { config } from '@wails/go/models';
import { FC, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { usePersistBehaviours } from './hooks/useBehaviours';

export const Behaviours: FC = () => {
  const currentSetting: config.AppBehaviours = useLoaderData();
  const form = useForm<config.AppBehaviours>({
    initialValues: {
      treatLoconAsLora: false
    }
  });
  const handleSubmit = usePersistBehaviours();

  useEffect(() => {
    form.setValues({
      treatLoconAsLora: currentSetting?.treatLoconAsLora ?? false
    });
  }, [currentSetting]);

  return (
    <Box w="100%" h="100vh" px="lg" py="md" component={ScrollArea}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Switch
            label="LyCORIS使用Lora激活标识（适用于SD WebUI 1.5.0版本以上）"
            {...form.getInputProps('treatLoconAsLora', { type: 'checkbox' })}
          />
          <Group spacing="md" py="sm">
            <Button type="submit" variant="filled">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};
