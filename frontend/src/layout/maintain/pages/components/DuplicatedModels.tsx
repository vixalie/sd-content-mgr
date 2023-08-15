import { useMeasureElement } from '@/hooks/useMeasureElement';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBoxOff } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { nanoid } from 'nanoid';
import { includes, isEmpty, isNil } from 'ramda';
import { FC, useEffect, useRef } from 'react';
import { useCleanModelsMeasure } from '../states/clean-models-measure';
import { useDuplicatedModels } from '../states/duplicate-models-state';

export const DuplicatedModels: FC = () => {
  const theme = useMantineTheme();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const contentContanerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaheight = useCleanModelsMeasure(
    state =>
      state.page.height - state.alert.height - state.tabs.height - state.control.height - 24 * 2
  );
  const [loading, deleting, duplicates, loadDuplicates, selectFile, selectedFiles, deleteSelected] =
    useDuplicatedModels(state => [
      state.loading,
      state.deleting,
      state.duplicates,
      state.loadDuplicatedModels,
      state.selectFile,
      state.selectedFiles,
      state.deleteSelected
    ]);

  useMeasureElement(panelRef, useCleanModelsMeasure, 'panel');
  useMeasureElement(controlRef, useCleanModelsMeasure, 'control');
  useMeasureElement(contentContanerRef, useCleanModelsMeasure, 'content');

  useEffect(() => {
    EventsOn('duplicated-model-deleted', () => {
      notifications.show({
        title: '删除成功',
        message: '已选择的重复模型极其关联文件已经删除。',
        color: 'green',
        withCloseButton: false
      });
    });

    return () => {
      EventsOff('duplicated-model-deleted');
    };
  });

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="flex-start"
      gap="sm"
      h="100%"
      ref={panelRef}
    >
      <Group spacing="sm" ref={controlRef} sx={{ minHeight: 'max-content' }}>
        <Button variant="filled" color="blue" onClick={loadDuplicates} loading={loading}>
          扫描重复模型
        </Button>
        <Button
          variant="filled"
          color="red"
          onClick={deleteSelected}
          disabled={loading || isEmpty(selectedFiles)}
          loading={deleting}
        >
          删除选定模型
        </Button>
      </Group>
      <Box w="100%" sx={{ flexGrow: 1, overflow: 'hidden' }} ref={contentContanerRef}>
        <ScrollArea h={scrollAreaheight}>
          <Stack spacing="sm">
            {duplicates.map(duplicate => (
              <Paper key={duplicate.hash} px="md" py="md">
                <Stack spacing="xs">
                  <Text>
                    {isNil(duplicate.model) ? `Hash: ${duplicate.hash}` : duplicate.model.name}
                  </Text>
                  {!isNil(duplicate.version) && !isNil(duplicate.model) && (
                    <Text>{duplicate.version.versionName}</Text>
                  )}
                  {duplicate.files.map(file => (
                    <Checkbox
                      key={nanoid()}
                      value={file.filePath}
                      label={
                        <Tooltip label={file.filePath} key={nanoid()}>
                          <Text fz="xs">{file.fileName}</Text>
                        </Tooltip>
                      }
                      checked={includes(file.filePath)(selectedFiles)}
                      onChange={event => selectFile(event.currentTarget.value)}
                    />
                  ))}
                </Stack>
              </Paper>
            ))}
            {isEmpty(duplicates) && (
              <Stack align="center" py="2.5rem">
                <IconBoxOff stroke={1} color={theme.colors.red[6]} size={64} />
                <Text>暂无需要清理的内容。</Text>
              </Stack>
            )}
          </Stack>
        </ScrollArea>
      </Box>
    </Flex>
  );
};
