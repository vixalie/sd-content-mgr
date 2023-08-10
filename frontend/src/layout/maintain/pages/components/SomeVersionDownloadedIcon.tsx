import type { DownloadStatus } from '@/types';
import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconVersions } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect } from 'react';
import { useDownloadState } from '../states/download-state';

export const SomeVersionDownloadedIcon: FC = () => {
  const theme = useMantineTheme();
  const state = useDownloadState.use.versionDownloaded();
  useEffect(() => {
    EventsOn('version-downloaded', (status: DownloadStatus) => {
      useDownloadState.setState(st => ({ versionDownloaded: status }));
    });

    return () => {
      EventsOff('version-downloaded');
    };
  }, []);

  return (
    <>
      {equals(state, 'unknown') && <IconVersions stroke={1} color={theme.colors.gray[6]} />}
      {equals(state, 'downloaded') && (
        <Tooltip label="模型其他版本已下载">
          <IconVersions stroke={1} color={theme.colors.green[6]} />
        </Tooltip>
      )}
      {equals(state, 'not-downloaded') && (
        <Tooltip label="模型所有版本均尚未下载">
          <IconVersions stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
