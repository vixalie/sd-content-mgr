import { Group, Progress, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fromBytes } from '@tsmx/human-readable';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { max } from 'ramda';
import { FC, useEffect, useMemo, useState } from 'react';
import { useDownloadState } from '../states/download-state';

type DownloadProgressProps = {};

type ProgressEventPayload = {
  state: string;
  completed?: number;
  total?: number;
  error?: string;
};

export const DownloadProgress: FC<DownloadProgressProps> = ({}) => {
  const modelVersionId = useDownloadState.use.selectedVersion();
  const total = useDownloadState.use.modelVersionTotalSize();
  const [downloaded, setDownloaded] = useState(0);
  const currentProgress = useMemo(() => {
    return Math.round((downloaded / max(1, total)) * 100);
  }, [total, downloaded]);

  useEffect(() => {
    EventsOn(`model-primary-file-${modelVersionId}`, (payload: ProgressEventPayload) => {
      switch (payload.state) {
        case 'start':
          setDownloaded(0);
          break;
        case 'finish':
          notifications.show({
            title: '模型下载完成',
            message: '选择的模型已经下载完成',
            color: 'green',
            autoClose: 5000,
            withCloseButton: false
          });
          break;
        case 'progress':
          setDownloaded(payload.completed ?? 0);
          break;
        default:
          break;
      }
    });
    return () => {
      EventsOff(`model-primary-file-${modelVersionId}`, () => {});
    };
  }, [modelVersionId]);
  useEffect(() => {
    EventsOn('reset-download', () => {
      setDownloaded(0);
    });

    return () => {
      EventsOff('reset-download');
    };
  }, []);

  return (
    <>
      <Group spacing="sm" grow>
        <Text sx={{ maxWidth: 'max-content' }}>文件大小：</Text>
        <Text sx={{ flexGrow: 1, maxWidth: 'max-content' }}>
          {fromBytes(total, { fixedPrecision: 2 })}
        </Text>
      </Group>
      <Group spacing="sm" grow>
        <Text sx={{ maxWidth: 'max-content' }}>已下载：</Text>
        <Text sx={{ flexGrow: 1, maxWidth: 'max-content' }}>
          {fromBytes(downloaded, { fixedPrecision: 2 })}
        </Text>
      </Group>
      <Progress
        radius="xs"
        size="xl"
        label={`${currentProgress}%`}
        color="green"
        value={currentProgress}
        striped
        animate
      />
    </>
  );
};
