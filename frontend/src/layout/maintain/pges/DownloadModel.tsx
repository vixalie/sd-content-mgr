import { Stack } from '@mantine/core';
import { FC } from 'react';
import { DownloadTarget } from './components/DownloadTarget';

export const DownloadModel: FC = () => {
  return (
    <Stack px="md" py="lg" spacing="md">
      <DownloadTarget />
    </Stack>
  );
};
