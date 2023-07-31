import { Badge, Group, Stack, Tabs, Text } from '@mantine/core';
import { entities, models } from '@wails/go/models';
import { FC } from 'react';
import { useLoaderData } from 'react-router-dom';

export const CachedModel: FC = () => {
  const [modelVersion, versions]: [entities.ModelVersion, models.SimplifiedModelVersion] =
    useLoaderData<[entities.FileCache, models.SimplifiedModelVersion]>();
  console.log('[debug]Model Version: ', modelVersion);

  return (
    <Stack px="md" py="lg" spacing="sm">
      <Text fz="lg" weight={500}>
        {modelVersion.model?.name ?? ''}
      </Text>
      <Group>
        <Badge color="teal">{modelVersion.versionName ?? ''}</Badge>
      </Group>
      <Tabs defaultValue="summary">
        <Tabs.List position="right">
          <Tabs.Tab value="summary">模型概要</Tabs.Tab>
          <Tabs.Tab value="description">描述</Tabs.Tab>
          <Tabs.Tab value="versions">同系列</Tabs.Tab>
          <Tabs.Tab value="operates">操作</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </Stack>
  );
};
