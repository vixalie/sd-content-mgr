import { Badge, Flex, Group, Stack, Tabs, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { entities, models } from '@wails/go/models';
import { FetchModelTags } from '@wails/go/models/ModelController';
import { nanoid } from 'nanoid';
import { isEmpty } from 'ramda';
import { FC, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ModelActivates } from './components/ModelActivates';
import { ModelDescription } from './components/ModelDeacription';
import { ModelOperates } from './components/ModelOperates';
import { ModelSummay } from './components/ModelSummary';
import { SameModelVersions } from './components/SameModelVersions';

export const CachedModel: FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('summary');
  const [modelVersion, versions]: [entities.ModelVersion, models.SimplifiedModelVersion[]] =
    useLoaderData<[entities.FileCache, models.SimplifiedModelVersion[]]>();
  const { data: tags } = useQuery({
    queryKey: ['model-tags', modelVersion.modelId],
    queryFn: async ({ queryKey }) => {
      const [_, modelId] = queryKey;
      return await FetchModelTags(modelId);
    }
  });

  useEffect(() => {
    setActiveTab('summary');
  }, [modelVersion]);

  return (
    <Stack px="md" py="lg" spacing="sm" h="100%">
      <Text fz="lg" weight={500}>
        {modelVersion.model?.name ?? ''}
      </Text>
      <Group>
        <Text fz="sm" color="gray">
          版本
        </Text>
        <Badge color="teal">{modelVersion.versionName ?? ''}</Badge>
      </Group>
      {!isEmpty(tags) && (
        <Flex direction="row" justify="flex-start" align="flex-start" wrap="nowrap" gap="md">
          <Text fz="sm" color="gray" sx={{ minWidth: 'max-content' }}>
            Civitai 标签
          </Text>
          <Flex direction="row" justify="flex-start" align="flex-start" gap="sm" wrap="wrap">
            {(tags ?? []).map(tag => (
              <Badge color="indigo" key={nanoid()}>
                {tag}
              </Badge>
            ))}
          </Flex>
        </Flex>
      )}
      <Tabs variant="outline" h="100%" value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List position="right">
          <Tabs.Tab value="summary">模型概要</Tabs.Tab>
          <Tabs.Tab value="activate">模型激活</Tabs.Tab>
          <Tabs.Tab value="description">描述</Tabs.Tab>
          <Tabs.Tab value="versions">同系列</Tabs.Tab>
          <Tabs.Tab value="operates">操作</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary" pt="xs" h="100%">
          <ModelSummay modelVersion={modelVersion} key={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="activate" pt="xs" h="100%">
          <ModelActivates
            modelVersionId={modelVersion.id}
            activatePrompts={modelVersion.activatePrompt}
          />
        </Tabs.Panel>

        <Tabs.Panel value="description" pt="xs" h="100%">
          <ModelDescription modelVersionId={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="versions" pt="xs" h="100%">
          <SameModelVersions modelVersions={versions} currentVersionId={modelVersion.id} />
        </Tabs.Panel>

        <Tabs.Panel value="operates" pt="xs" h="100%">
          <ModelOperates modelVersionId={modelVersion.id} modelId={modelVersion.modelId} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
