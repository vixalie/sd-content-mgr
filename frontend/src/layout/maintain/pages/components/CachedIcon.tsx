import type { CacheStatus } from '@/types';
import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect } from 'react';
import { useDownloadState } from '../states/download-state';

export const CachedIcon: FC = () => {
  const theme = useMantineTheme();
  const state = useDownloadState.use.cacheStatus();
  useEffect(() => {
    EventsOn('cache-status', (status: CacheStatus) => {
      useDownloadState.setState(st => ({ cacheStatus: status }));
    });

    return () => {
      EventsOff('cache-status');
    };
  }, []);
  return (
    <>
      {equals(state, 'unknown') && <IconDatabase stroke={1} color={theme.colors.gray[6]} />}
      {equals(state, 'cached') && (
        <Tooltip label="模型信息已缓存">
          <IconDatabase stroke={1} color={theme.colors.green[6]} />
        </Tooltip>
      )}
      {equals(state, 'not-cached') && (
        <Tooltip label="模型信息尚未缓存">
          <IconDatabase stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
