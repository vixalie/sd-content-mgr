import { MoldelSelections } from '@/constants/models';
import {
  Button,
  Divider,
  Group,
  Progress,
  Select,
  SelectItem,
  Stack,
  Text,
  TextInput,
  useMantineTheme
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@wails/go/models';
import {
  FetchDownloadModelVersion,
  FetchModelInfo,
  GetModelSubCategoryDirs
} from '@wails/go/models/ModelController';
import { RefreshModelInfo } from '@wails/go/remote/RemoteController';
import { EventsEmit } from '@wails/runtime/runtime';
import { equals, includes, isEmpty, isNil, not, toLower } from 'ramda';
import { FC, useCallback, useMemo, useState } from 'react';
import { CachedIcon } from './CachedIcon';
import { ModelDownloadedIcon } from './ModelDownloadedIcon';
import { NotFoundIcon } from './NotFoundIcon';
import { SomeVersionDownloadedIcon } from './SomeVersionDownloadedIcon';

const hostPathSelection: string = '/';

export const DownloadTarget: FC = () => {
  const theme = useMantineTheme();
  const [url, setUrl] = useUncontrolled({
    defaultValue: ''
  });
  const [modelCategory, setModelCategory] = useUncontrolled({
    defaultValue: ''
  });
  const [targetSubPath, setTargetSubPath] = useUncontrolled({
    defaultValue: hostPathSelection
  });
  const [selectedVersion, setSelectedVersion] = useUncontrolled<number | undefined>({
    defaultValue: 0,
    onChange: (value: number) => {
      if (not(equals(value, 0)) && includes(value, downloadedVersions)) {
        EventsEmit('model-downloaded', 'downloaded');
      } else {
        EventsEmit('model-downloaded', 'undownloaded');
      }
    }
  });
  const { data: modelCatePath } = useQuery({
    queryKey: ['model-target-cate', 'webui', modelCategory],
    initialData: [],
    enabled: !isNil(modelCategory) && !isEmpty(modelCategory),
    queryFn: async ({ queryKey }) => {
      const [_, ui, category] = queryKey;
      const data = await GetModelSubCategoryDirs(ui, category);
      return data;
    },
    select: data => [hostPathSelection, ...(data ?? [])]
  });
  const [model, setModel] = useState<entities.Model | null>(null);
  const [downloadedVersions, setDownloadedVersions] = useState<number[]>([]);
  const [availableVersions, setAvailableVersions] = useState<SelectItem[]>([]);

  const modelName = useMemo(() => model?.name ?? '', [model]);
  const partialReset = useCallback(() => {
    setModelCategory('');
    setTargetSubPath(hostPathSelection);
    setSelectedVersion(0);
    setAvailableVersions([]);
    setDownloadedVersions([]);
    setModel(null);
    EventsEmit('cache-status', 'unknown');
    EventsEmit('model-downloaded', 'unknown');
    EventsEmit('version-downloaded', 'unknown');
    EventsEmit('model-found', 'unknown');
  }, []);
  const resetDownload = useCallback(() => {
    setUrl('');
    setModelCategory('');
    setTargetSubPath(hostPathSelection);
    setSelectedVersion(0);
    setAvailableVersions([]);
    setDownloadedVersions([]);
    setModel(null);
    EventsEmit('cache-status', 'unknown');
    EventsEmit('model-downloaded', 'unknown');
    EventsEmit('version-downloaded', 'unknown');
    EventsEmit('model-found', 'unknown');
  }, []);
  const fetchRequestModelInfo = useCallback(async () => {
    try {
      partialReset();
      const urlMatch = url.match(/\/(\d+)\/?/);
      if (isNil(urlMatch) && isEmpty(urlMatch)) {
        throw new Error('未能从URL中解析出模型ID');
      }
      const modelId = parseInt(urlMatch[1]);
      await RefreshModelInfo(modelId);
      const modelInfo = await FetchModelInfo(modelId);
      setModel(modelInfo);
      setModelCategory(toLower(modelInfo?.type ?? ''));
      setAvailableVersions(
        (modelInfo?.versions ?? []).map(v => ({ value: v.id, label: v.versionName }))
      );
      const localVersions = await FetchDownloadModelVersion(modelId);
      setDownloadedVersions(localVersions);
      if (not(isEmpty(localVersions))) {
        EventsEmit('version-downloaded', 'downloaded');
      } else {
        EventsEmit('version-downloaded', 'undownloaded');
      }
    } catch (e) {
      console.error('[error]使用URL获取指定模型信息', e, url);
      notifications.show({
        title: '模型信息获取失败',
        message: `指定模型信息未能成功获取，请检查模型链接以及网络是否正常并再次常事获取。${e}`,
        color: 'red',
        autoClose: 5000,
        withCloseButton: false
      });
    }
  }, [url]);

  return (
    <Stack spacing="md">
      <TextInput
        label="模型链接"
        placeholder="粘贴模型的Civitai URL"
        value={url}
        onChange={event => setUrl(event.currentTarget.value)}
      />
      <Button onClick={fetchRequestModelInfo}>检索模型信息</Button>
      <Group spacing="sm" grow>
        <Text sx={{ maxWidth: 'max-content' }}>模型名称：</Text>
        <Text sx={{ flexGrow: 1, maxWidth: 'max-content' }}>{modelName}</Text>
      </Group>
      <Group spacing="sm">
        <Select label="模型类别" readOnly data={MoldelSelections} value={modelCategory} />
        <Select
          label="目标分类目录"
          data={modelCatePath}
          value={targetSubPath}
          onChange={setTargetSubPath}
        />
        <Select
          label="模型版本"
          value={selectedVersion}
          onChange={setSelectedVersion}
          data={availableVersions}
        />
        <Group spacing="sm" sx={{ alignSelf: 'flex-end' }}>
          <CachedIcon />
          <ModelDownloadedIcon />
          <SomeVersionDownloadedIcon />
          <NotFoundIcon />
        </Group>
      </Group>
      <Group spacing="sm" grow>
        <Button disabled={equals(selectedVersion, 0)}>下载模型</Button>
        <Button color="red" onClick={resetDownload}>
          重置下载
        </Button>
      </Group>
      <Progress radius="xs" color="blue" />
      <Group spacing="md">
        <Text sx={{ minWidth: 'max-content' }}>当前状态：</Text>
        <Text sx={{ flexGrow: 1 }}></Text>
      </Group>
      <Divider color="gray" />
    </Stack>
  );
};
