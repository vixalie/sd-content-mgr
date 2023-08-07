import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect, useState } from 'react';

type DownloadedState = 'unknown' | 'downloaded' | 'undownloaded';

export const ModelDownloadedIcon: FC = () => {
  const theme = useMantineTheme();
  const [state, setState] = useState<DownloadedState>('unknown');
  useEffect(() => {
    EventsOn('model-downloaded', (status: DownloadedState) => {
      setState(status);
    });

    return () => {
      EventsOff('model-downloaded');
    };
  }, []);

  return (
    <>
      {equals(state, 'unknown') && <IconDownload stroke={1} color={theme.colors.gray[6]} />}
      {equals(state, 'downloaded') && (
        <Tooltip label="模型已下载">
          <IconDownload stroke={1} color={theme.colors.green[6]} />
        </Tooltip>
      )}
      {equals(state, 'undownloaded') && (
        <Tooltip label="模型尚未下载">
          <IconDownload stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
