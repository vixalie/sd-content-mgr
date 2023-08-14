import { Alert, Button, Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAsync, useList } from '@react-hookz/web';
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconArrowBarDown,
  IconCheck,
  IconScanEye
} from '@tabler/icons-react';
import { ScanAllResouces } from '@wails/go/models/ModelController';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { equals } from 'ramda';
import { FC, useEffect } from 'react';

type TaskItem = {
  filePath: string;
  status: 'scanning' | 'skipped' | 'success' | 'error';
};
type ScanEventPayload = {
  state: string;
  file: string;
  message?: string;
};

const TaskPaper: FC<TaskItem> = ({ filePath, status }) => {
  const theme = useMantineTheme();
  return (
    <Paper px="md" py="sm">
      <Group>
        {equals('scanning', status) && <IconScanEye stroke={1} color={theme.colors.blue[6]} />}
        {equals('skipped', status) && (
          <IconArrowBarDown stroke={1} color={theme.colors.yellow[6]} />
        )}
        {equals('success', status) && <IconCheck stroke={1} color={theme.colors.green[6]} />}
        {equals('error', status) && <IconAlertTriangle stroke={1} color={theme.colors.red[6]} />}
        <Text fz="xs">{filePath}</Text>
      </Group>
    </Paper>
  );
};

export const ScanModel: FC = () => {
  const theme = useMantineTheme();
  const [taskList, { push, updateFirst, filter }] = useList<TaskItem>([]);
  const [state, { execute }] = useAsync(async () => {
    try {
      await ScanAllResouces();
    } catch (e) {
      console.error('[error]扫描全部模型：', e);
      notifications.show({
        title: '扫描模型失败',
        message: `未能成功扫描全部模型，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, []);

  useEffect(() => {
    EventsOn('mass-scan-file', ({ state, file, message }: ScanEventPayload) => {
      console.log('[debug]MassScan: ', state, file, message);
      switch (state) {
        case 'start':
          push({ filePath: file, status: 'scanning' });
          break;
        case 'skipped':
          updateFirst((a, b) => equals(a.filePath, b.filePath), {
            filePath: file,
            status: 'skipped'
          });
          break;
        case 'done':
          updateFirst((a, b) => equals(a.filePath, b.filePath), {
            filePath: file,
            status: 'success'
          });
          break;
        case 'end':
          setTimeout(() => {
            filter(item => !equals(item.filePath, file));
          }, 2000);
          break;
        case 'error':
          updateFirst((a, b) => equals(a.filePath, b.filePath), {
            filePath: file,
            status: 'error'
          });
          break;
        default:
          break;
      }
    });

    return () => {
      EventsOff('mass-scan-file');
    };
  }, []);

  return (
    <Stack px="md" py="lg" spacing="md">
      <Alert icon={<IconAlertHexagon stroke={1} size={24} />} color="red" title="缓慢操作警告">
        <Text>
          扫描全部模型会根据当前缓存数据库中的已经保存的内容决定所需处理的内容数量。如果应用是全新使用状态，而且Stable
          Diffusion WebUI中已经放置了较多的模型，那么将会扫描很长的时间。
        </Text>
      </Alert>
      <Group spacing="sm">
        <Button
          color="blue"
          variant="filled"
          loading={equals(state.status, 'loading')}
          onClick={execute}
        >
          扫描所有模型
        </Button>
      </Group>
      {taskList.map(task => (
        <TaskPaper {...task} />
      ))}
    </Stack>
  );
};
