import { Badge, Flex, Stack, Tabs, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconDeviceFloppy, IconEyeExclamation } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { entities, models } from '@wails/go/models';
import { FetchModelTags } from '@wails/go/models/ModelController';
import { nanoid } from 'nanoid';
import { isEmpty, isNil } from 'ramda';
import { FC, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ModelActivates } from './components/ModelActivates';
import { ModelDescription } from './components/ModelDeacription';
import { ModelOperates } from './components/ModelOperates';
import { ModelSummay } from './components/ModelSummary';
import { SameModelVersions } from './components/SameModelVersions';

export const CachedModel: FC = () => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState<string | null>('summary');
  const [modelVersion, versions, versionDownloaded]: [
    entities.ModelVersion,
    models.SimplifiedModelVersion[],
    boolean
  ] = useLoaderData<[entities.FileCache, models.SimplifiedModelVersion[], boolean]>();
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
      <Flex direction="row" justify="flex-start" align="center" gap="md">
        <Text fz="sm" color="gray">
          版本
        </Text>
        <Flex direction="row" justify="flex-start" align="center" gap="sm" sx={{ flexGrow: 1 }}>
          <Badge color="teal">{modelVersion.versionName ?? ''}</Badge>
        </Flex>
        {isNil(modelVersion.model) ? (
          <Tooltip label="未知分级状态">
            <IconEyeExclamation stroke={1} color={theme.colors.yellow[6]} size={24} />
          </Tooltip>
        ) : modelVersion.model.nsfw ? (
          <Tooltip label="NSFW">
            <IconEyeExclamation stroke={1} color={theme.colors.red[6]} size={24} />
          </Tooltip>
        ) : (
          <Tooltip label="SFW">
            <IconEyeExclamation stroke={1} color={theme.colors.green[6]} size={24} />
          </Tooltip>
        )}
        {versionDownloaded ? (
          <Tooltip label="模型已下载">
            <IconDeviceFloppy stroke={1} color={theme.colors.green[6]} size={24} />
          </Tooltip>
        ) : (
          <Tooltip label="模型尚未下载">
            <IconDeviceFloppy stroke={1} color={theme.colors.red[6]} size={24} />
          </Tooltip>
        )}
      </Flex>
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
