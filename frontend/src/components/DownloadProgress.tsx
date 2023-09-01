import { Group, Progress, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { fromBytes } from '@tsmx/human-readable';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { max } from 'ramda';
import { FC, useEffect, useMemo, useState } from 'react';

type ProgressEventPayload = {
  state: string;
  completed?: number;
  total?: number;
  error?: string;
};

function useDownloadProgressControl(
  modelVersionId: number,
  lock: () => void,
  unlock: () => void
): [number] {
  const [downloaded, setDownloaded] = useState(0);

  useEffect(() => {
    EventsOn(`model-primary-file-${modelVersionId}`, (payload: ProgressEventPayload) => {
      switch (payload.state) {
        case 'start':
          lock();
          setDownloaded(0);
          break;
        case 'finish':
          notifications.show({
            title: '模型下载完成',
            message: '选择的模型已经下载完成',
            color: 'green',
            withCloseButton: false
          });
          unlock();
          break;
        case 'progress':
          setDownloaded(payload.completed ?? 0);
          break;
        default:
          unlock();
          break;
      }
    });
    return () => {
      EventsOff(`model-primary-file-${modelVersionId}`);
    };
  }, [modelVersionId, lock, unlock]);
  useEffect(() => {
    EventsOn('reset-download', () => {
      setDownloaded(0);
    });

    return () => {
      EventsOff('reset-download');
    };
  }, []);

  return [downloaded];
}

type DownloadProgressProps = {
  modelVersion: number;
  total: number;
  lock: () => void;
  unlock: () => void;
};

export const DownloadProgress: FC<DownloadProgressProps> = ({
  modelVersion,
  total,
  lock,
  unlock
}) => {
  const [downloaded] = useDownloadProgressControl(modelVersion, lock, unlock);
  const currentProgress = useMemo(() => {
    return Math.round((downloaded / max(1, total)) * 100);
  }, [total, downloaded]);

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
      />
    </>
  );
};
