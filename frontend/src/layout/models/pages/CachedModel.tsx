import { Badge, Group, Stack, Tabs, Text } from '@mantine/core';
import { entities, models } from '@wails/go/models';
import { FC, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ModelDescription } from './components/ModelDeacription';
import { ModelOperates } from './components/ModelOperates';
import { ModelSummay } from './components/ModelSummary';
import { SAmeModelVersions } from './components/SameModelVersions';

export const CachedModel: FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('summary');
  const [modelVersion, versions]: [entities.ModelVersion, models.SimplifiedModelVersion] =
    useLoaderData<[entities.FileCache, models.SimplifiedModelVersion]>();

  useEffect(() => {
    setActiveTab('summary');
  }, [modelVersion]);

  return (
    <Stack px="md" py="lg" spacing="sm" h="100%">
      <Text fz="lg" weight={500}>
        {modelVersion.model?.name ?? ''}
      </Text>
      <Group>
        <Badge color="teal">{modelVersion.versionName ?? ''}</Badge>
      </Group>
      <Tabs variant="outline" h="100%" value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List position="right">
          <Tabs.Tab value="summary">模型概要</Tabs.Tab>
          <Tabs.Tab value="description">描述</Tabs.Tab>
          <Tabs.Tab value="versions">同系列</Tabs.Tab>
          <Tabs.Tab value="operates">操作</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary" pt="xs" h="100%">
          <ModelSummay modelVersion={modelVersion} key={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="description" pt="xs" h="100%">
          <ModelDescription modelVersionId={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="versions" pt="xs" h="100%">
          <SAmeModelVersions modelVersionId={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="operates" pt="xs" h="100%">
          <ModelOperates modelVersionId={modelVersion.id} modelId={modelVersion.modelId} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
