import { useMeasureElement } from '@/hooks/useMeasureElement';
import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAsync, useList } from '@react-hookz/web';
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconCheck,
  IconScanEye,
  IconX
} from '@tabler/icons-react';
import { BatchUpdateModelInfo } from '@wails/go/remote/RemoteController';
import { EventsOff, EventsOn } from '@wails/runtime/runtime';
import { any, equals, gt, propEq, toLower, values } from 'ramda';
import { FC, useEffect, useMemo, useRef } from 'react';
import { useRefreshModel } from './states/refresh-model-state';

type ScanTaskDescribe = {
  id: number;
  name: string;
  retries: number;
  status: string;
  message: string;
};

const ModelTask: FC<ScanTaskDescribe> = props => {
  const theme = useMantineTheme();
  const msgColor = useMemo(() => {
    switch (toLower(props.status)) {
      case 'start':
        return theme.colors.blue[6];
      case 'success':
        return theme.colors.green[6];
      case 'error':
        return theme.colors.red[9];
      case 'failed':
        return theme.colors.red[9];
      default:
        return theme.colors.gray[6];
    }
  }, [props.status, props.retries]);

  return (
    <Paper px="md" py="sm">
      <Group spacing="sm">
        {equals('start', props.status) && (
          <IconScanEye stroke={1} color={theme.colors.blue[6]} size={36} />
        )}
        {equals('success', props.status) && (
          <IconCheck stroke={1} color={theme.colors.green[6]} size={36} />
        )}
        {equals('error', props.status) && (
          <IconAlertTriangle stroke={1} color={theme.colors.red[6]} size={36} />
        )}
        {equals('failed', props.status) && (
          <IconX stroke={1} color={theme.colors.red[6]} size={36} />
        )}
        <Stack spacing="xs">
          <Group spacing="sm" align="flex-end">
            <Text fz="sm">{props.name}</Text>
            {gt(props.retries, 0) && (
              <Text fz="xs" color="pink">
                第 {props.retries + 1} 次重试
              </Text>
            )}
          </Group>
          <Text fz="xs" color={msgColor} mih="1rem">
            {props.message}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
};

export const RefreshModel: FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const scrollAreaHeight = useRefreshModel(
    state => state.page.height - state.alert.height - state.control.height - 24 * 2
  );
  const [tasks, { push, updateFirst, upsert, filter }] = useList<ScanTaskDescribe>([]);
  const [state, { execute }] = useAsync(async () => {
    try {
      await BatchUpdateModelInfo();
      notifications.show({
        title: '批量更新模型信息成功',
        message: `已经成功批量更新模型信息。`,
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]批量更新模型信息', e);
      notifications.show({
        title: '批量更新模型信息失败',
        message: `未能成功批量更新模型信息，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  });

  useMeasureElement(pageRef, useRefreshModel, 'page');
  useMeasureElement(alertRef, useRefreshModel, 'alert');
  useMeasureElement(controlRef, useRefreshModel, 'control');

  useEffect(() => {
    EventsOn('model-update', (payload: ScanTaskDescribe) => {
      console.log('[debug]模型信息更新：', payload);
      switch (toLower(payload.status)) {
        case 'start':
          upsert(item => propEq(payload.id, 'id', item), payload);
          break;
        case 'error':
          updateFirst(propEq(payload.id, 'id'), payload);
          break;
        case 'success':
        case 'failed':
          updateFirst(propEq(payload.id, 'id'), payload);
          setTimeout(() => {
            filter(item => !equals(item.id, payload.id));
          }, 3000);
        default:
          return;
      }
    });

    return () => {
      EventsOff('model-update');
    };
  }, []);

  return (
    <Stack px="md" py="lg" spacing="md" h="100vh" ref={pageRef}>
      <Box sx={{ minHeight: 'max-content' }}>
        <Alert
          icon={<IconAlertHexagon stroke={1} size={24} />}
          color="red"
          title="缓慢操作警告"
          ref={alertRef}
        >
          <Text>
            从Civitai批量更新模型信息根据已经下载的模型数量，可能会花费很长的时间。应用会自动在请求和错误重试之间添加延迟，以确保不会超过Civitai的请求限制。
          </Text>
        </Alert>
      </Box>
      <Group spacing="sm" ref={controlRef}>
        <Button color="blue" variant="filled" loading={equals(state, 'loading')} onClick={execute}>
          刷新所有模型信息
        </Button>
      </Group>
      <ScrollArea h={scrollAreaHeight}>
        <Stack spacing="sm">
          {values(tasks).map(task => (
            <ModelTask key={task.id} {...task} />
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};
