import { Progress } from '@mantine/core';
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
  const [total, setTotal] = useState(1);
  const [downloaded, setDownloaded] = useState(0);
  const currentProgress = useMemo(() => {
    return (downloaded / max(1, total)) * 100;
  }, [total, downloaded]);

  useEffect(() => {
    EventsOn(`model-primary-file-${modelVersionId}`, (payload: ProgressEventPayload) => {
      switch (payload.state) {
        case 'start':
          setTotal(1);
          setDownloaded(0);
          break;
        case 'finish':
          setTotal(1);
          setDownloaded(1);
          break;
        case 'progress':
          setTotal(payload.total ?? 1);
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

  return <Progress radius="xs" color="blue" value={currentProgress} />;
};
