import type { FileScanStatus } from '@/types';
import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconScan } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect } from 'react';
import { useDownloadState } from '../states/download-state';

export const FileScanIcon: FC = () => {
  const theme = useMantineTheme();
  const state = useDownloadState.use.fileScanned();
  useEffect(() => {
    EventsOn('file-scanned', (status: FileScanStatus) => {
      useDownloadState.setState(st => ({ fileScanned: status }));
    });

    return () => {
      EventsOff('file-scanned');
    };
  }, []);

  return (
    <>
      {equals(state, 'unknown') && <IconScan stroke={1} color={theme.colors.gray[6]} />}
      {equals(state, 'scanned') && (
        <Tooltip label="模型在Civitai上已经完成扫描，可以下载">
          <IconScan stroke={1} color={theme.colors.green[6]} />
        </Tooltip>
      )}
      {equals(state, 'not-scanned') && (
        <Tooltip label="模型在Civitai上尚未完成扫描，建议稍后再试">
          <IconScan stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
