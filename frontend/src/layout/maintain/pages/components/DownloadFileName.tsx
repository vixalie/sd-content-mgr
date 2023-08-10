import {
  Badge,
  Box,
  Group,
  SegmentedControl,
  TextInput,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { equals } from 'ramda';
import { FC } from 'react';
import { overwriteStateSelector, useDownloadState } from '../states/download-state';

export const DownloadFileName: FC = () => {
  const theme = useMantineTheme();
  const [modelFileName, modelFileExt, modelFileExists, setModelFileName] = useDownloadState(st => [
    st.modelVersionFileName,
    st.modelVersionFileExt,
    st.modelVersionFileExists,
    st.setModelVersionFilename
  ]);
  const overwriteState = useDownloadState(overwriteStateSelector());

  return (
    <Group spacing="sm" w="100%">
      <TextInput
        label="下载文件名"
        value={modelFileName}
        onChange={event => setModelFileName(event.currentTarget.value)}
        rightSection={<Badge color="gray">{modelFileExt}</Badge>}
        rightSectionWidth={120}
        sx={{ flexGrow: 1 }}
      />
      <Box sx={{ alignSelf: 'flex-end' }}>
        {modelFileExists ? (
          <Tooltip label="指定文件名的文件在目标文件夹中已经存在，下载时请注意。">
            <IconAlertTriangle stroke={1} color={theme.colors.red[6]} />
          </Tooltip>
        ) : (
          <IconAlertTriangle stroke={1} color={theme.colors.cfg[3]} size={24} />
        )}
      </Box>
      <SegmentedControl
        value={overwriteState}
        onChange={value =>
          useDownloadState.setState(st => ({ overwrite: equals(value, 'overwrite') }))
        }
        data={[
          { label: '断点续传', value: 'continuous' },
          { label: '覆盖', value: 'overwrite' }
        ]}
        maw={240}
        sx={{ alignSelf: 'flex-end' }}
      />
    </Group>
  );
};
