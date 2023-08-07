import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconVersions } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect, useState } from 'react';

type DownloadedState = 'unknown' | 'downloaded' | 'undownloaded';

export const SomeVersionDownloadedIcon: FC = () => {
  const theme = useMantineTheme();
  const [state, setState] = useState<DownloadedState>('unknown');
  useEffect(() => {
    EventsOn('version-downloaded', (status: DownloadedState) => {
      setState(status);
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
      {equals(state, 'undownloaded') && (
        <Tooltip label="模型所有版本均尚未下载">
          <IconVersions stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
