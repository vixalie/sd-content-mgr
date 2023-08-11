import { Button, Divider, Group, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DownloadModelVersion } from '@wails/go/remote/RemoteController';
import { EventsEmit, EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals, isEmpty, isNil } from 'ramda';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useDownloadState } from '../states/download-state';
import { CachedIcon } from './CachedIcon';
import { DownloadFileName } from './DownloadFileName';
import { DownloadProgress } from './DownloadProgress';
import { DownloadSetup } from './DownloadSetup';
import { ModelDownloadedIcon } from './ModelDownloadedIcon';
import { NotFoundIcon } from './NotFoundIcon';
import { SomeVersionDownloadedIcon } from './SomeVersionDownloadedIcon';

const hostPathSelection: string = '/';

export const DownloadTarget: FC = () => {
  const theme = useMantineTheme();
  const [
    url,
    targetSubPath,
    selectedVersion,
    model,
    partialReset,
    loadModelInfo,
    fileName,
    overwrite
  ] = useDownloadState(st => [
    st.url,
    st.subPath,
    st.selectedVersion,
    st.model,
    st.partialReset,
    st.loadModelInfo,
    st.modelVersionFileName,
    st.overwrite
  ]);

  const modelName = useMemo(() => model?.name ?? '', [model]);
  const resetDownload = useCallback(() => {
    useDownloadState.reset();
    EventsEmit('reset-download');
  }, []);
  const fetchRequestModelInfo = useCallback(async () => {
    try {
      partialReset();
      const urlMatch = url.match(/\/(\d+)\/?/);
      if (isNil(urlMatch) && isEmpty(urlMatch)) {
        throw new Error('未能从URL中解析出模型ID');
      }
      const modelId = parseInt(urlMatch[1]);
      await loadModelInfo(modelId);
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
  const handleDownload = useCallback(async () => {
    try {
      if (isNil(selectedVersion)) {
        throw new Error('未选择要下载的模型版本');
      }
      console.log('[debug]download: ', selectedVersion, fileName, targetSubPath, overwrite);
      await DownloadModelVersion('webui', targetSubPath, fileName, selectedVersion, overwrite);
    } catch (e) {
      console.error('[error]下载模型：', e);
      notifications.show({
        title: '模型下载失败',
        message: `模型下载失败，请检查网络是否正常并再次尝试。${e}`,
        color: 'red',
        autoClose: 5000,
        withCloseButton: false
      });
    }
  }, [selectedVersion, fileName, overwrite, targetSubPath]);

  useEffect(() => {
    EventsOn('model-primary-file-download-error', err => {
      console.error('[error]模型主文件下载错误：', err);
      notifications.show({
        title: '模型主文件下载错误',
        message: `模型主文件下载错误，请检查网络是否正常并再次尝试。${err}`,
        color: 'red',
        autoClose: 5000,
        withCloseButton: false
      });
    });
    EventsOn('model-preview-download-error', err => {
      console.error('[error]模型预览文件下载错误：', err);
    });

    return () => {
      EventsOff('model-primary-file-download-error');
      EventsOff('model-preview-download-error');
    };
  });

  return (
    <Stack spacing="md">
      <TextInput
        label="模型链接"
        placeholder="粘贴模型的Civitai URL"
        value={url}
        onChange={event => useDownloadState.setState(st => ({ url: event.currentTarget.value }))}
      />
      <Button onClick={fetchRequestModelInfo}>检索模型信息</Button>
      <Group spacing="sm" grow>
        <Text sx={{ maxWidth: 'max-content' }}>模型名称：</Text>
        <Text sx={{ flexGrow: 1, maxWidth: 'max-content' }}>{modelName}</Text>
      </Group>
      <Group spacing="sm">
        <DownloadSetup />
        <Group spacing="sm" sx={{ alignSelf: 'flex-end' }}>
          <CachedIcon />
          <ModelDownloadedIcon />
          <SomeVersionDownloadedIcon />
          <NotFoundIcon />
        </Group>
      </Group>
      <Group spacing="sm" grow>
        <Button disabled={equals(selectedVersion, 0)} onClick={handleDownload}>
          下载模型
        </Button>
        <Button color="red" onClick={resetDownload}>
          重置下载
        </Button>
      </Group>
      <DownloadFileName />
      <DownloadProgress modelVersionId={selectedVersion} />
      <Divider color="gray" />
    </Stack>
  );
};
