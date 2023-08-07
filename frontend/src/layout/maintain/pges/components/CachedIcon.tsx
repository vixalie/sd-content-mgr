import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect, useState } from 'react';

type CacheStatus = 'unknown' | 'cached' | 'uncached';

export const CachedIcon: FC = () => {
  const theme = useMantineTheme();
  const [state, setState] = useState<CacheStatus>('unknown');
  useEffect(() => {
    EventsOn('cache-status', (status: CacheStatus) => {
      setState(status);
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
      {equals(state, 'uncached') && (
        <Tooltip label="模型信息尚未缓存">
          <IconDatabase stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
