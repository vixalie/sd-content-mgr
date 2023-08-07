import { Tooltip, useMantineTheme } from '@mantine/core';
import { IconError404, IconError404Off } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect, useState } from 'react';

type FoundState = 'unknown' | 'found' | 'not-found';

export const NotFoundIcon: FC = () => {
  const theme = useMantineTheme();
  const [state, setState] = useState<FoundState>('unknown');
  useEffect(() => {
    EventsOn('model-found', (status: FoundState) => {
      setState(status);
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
