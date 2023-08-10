import type { FoundStatus } from '@/types';
import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconError404, IconError404Off } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect } from 'react';
import { useDownloadState } from '../states/download-state';

export const NotFoundIcon: FC = () => {
  const theme = useMantineTheme();
  const state = useDownloadState.use.modelFound();
  useEffect(() => {
    EventsOn('model-found', (status: FoundStatus) => {
      useDownloadState.setState(st => ({ modelFound: status }));
    });

    return () => {
      EventsOff('model-found');
    };
  }, []);

  return (
    <>
      {equals(state, 'unknown') && <IconError404 stroke={1} color={theme.colors.gray[6]} />}
      {equals(state, 'found') && (
        <Tooltip label="模型在Civitai上可用">
          <IconError404Off stroke={1} color={theme.colors.green[6]} />
        </Tooltip>
      )}
      {equals(state, 'not-found') && (
        <Tooltip label="模型在Civitai上已不可用">
          <IconError404 stroke={1} color={theme.colors.red[6]} />
        </Tooltip>
      )}
    </>
  );
};
