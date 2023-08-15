import {
  Box,
  Button,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBoxOff } from '@tabler/icons-react';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { nanoid } from 'nanoid';
import { includes, isEmpty } from 'ramda';
import { FC, useEffect, useRef } from 'react';
import { useUnexistModels } from '../hooks/unexist-models-state';
import { useCleanModelsMeasure } from '../states/clean-models-measure';

export const UnexistModels: FC = () => {
  const theme = useMantineTheme();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const contentContanerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaheight = useCleanModelsMeasure(
    state =>
      state.page.height - state.alert.height - state.tabs.height - state.control.height - 24 * 2
  );
  const [unexists, loadRecords, loading, selectedRecord, selectRecord, deleting, deleteRecord] =
    useUnexistModels(state => [
      state.unexists,
      state.loadUnexists,
      state.loading,
      state.selectedRecords,
      state.selectRecord,
      state.deleting,
      state.deleteRecords
    ]);

  useEffect(() => {
    EventsOn('invalid-cache-deleted', () => {
      notifications.show({
        title: '清理完成',
        message: '已选择的无效缓存条目已经删除。',
        color: 'green',
        withCloseButton: false
      });
    });

    return () => {
      EventsOff('invalid-cache-deleted');
    };
  }, []);

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
        <Button variant="filled" color="blue" onClick={loadRecords} loading={loading}>
          扫描模型记录
        </Button>
        <Button
          variant="filled"
          color="red"
          disabled={loading || isEmpty(selectedRecord)}
          loading={deleting}
          onClick={deleteRecord}
        >
          删除选定记录
        </Button>
      </Group>
      <Box w="100%" sx={{ flexGrow: 1, overflow: 'hidden' }} ref={contentContanerRef}>
        <ScrollArea h={scrollAreaheight}>
          <Stack spacing="sm">
            {unexists.map(record => (
              <UnstyledButton key={nanoid()} onClick={() => selectRecord(record.id)}>
                <Paper
                  px="md"
                  py="md"
                  sx={
                    includes(record.id, selectedRecord)
                      ? { backgroundColor: theme.colors.blue[8] }
                      : {}
                  }
                >
                  <Stack spacing="xs">
                    <Text>{record.fileName}</Text>
                  </Stack>
                </Paper>
              </UnstyledButton>
            ))}
            {isEmpty(unexists) && (
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
