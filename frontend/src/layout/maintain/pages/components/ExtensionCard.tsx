import { Box, Button, Flex, Group, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAsync, useMountEffect } from '@react-hookz/web';
import {
  Branches,
  CheckDifference,
  CurrentBranch,
  CurrentRemote,
  Fetch,
  Pull,
  Remotes
} from '@wails/go/git/GitController';
import { equals, gt } from 'ramda';
import { FC, useCallback, useMemo, useState } from 'react';

type ExtensionCardProps = {
  name: string;
  path: string;
};
const StateDisplay = {
  '0': ['gray', '尚未检查更新'],
  '1': ['green', '已是最新'],
  '2': ['red', '有更新']
};

export const ExtensionCard: FC<ExtensionCardProps> = ({ name, path }) => {
  const [remotes, setRemotes] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [activeRemote, setActiveRemote] = useState<string>('');
  const [selectedRemote, setSelectedRemote] = useState<string>('');
  const [activeBranch, setActiveBranch] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [difference, setDifference] = useState<number>(0);
  const [detected, setDetected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const state = useMemo(() => {
    if (detected) {
      if (gt(difference, 0)) {
        return '2';
      } else {
        return '1';
      }
    } else {
      return '0';
    }
  }, [detected, difference]);
  const [gitState, gitAction] = useAsync(async () => {
    try {
      setChecking(true);
      const remotes = await Remotes(path);
      setRemotes(remotes);
      const branches = await Branches(path);
      setBranches(branches);
      const currentRemote = await CurrentRemote(path);
      setSelectedRemote(currentRemote);
      setActiveRemote(currentRemote);
      const currentBranch = await CurrentBranch(path);
      setSelectedBranch(currentBranch);
      setActiveBranch(currentBranch);
    } catch (e) {
      console.error('[error]加载插件Git状态', e);
      notifications.show({
        title: '加载插件Git状态失败',
        message: `加载插件 ${name} 版本库状态失败。`,
        color: 'red',
        withCloseButton: false
      });
    } finally {
      setChecking(false);
    }
  }, []);
  const fetchUpdate = useCallback(async () => {
    try {
      setUpdating(true);
      await Fetch(path, selectedRemote);
      const differ = await CheckDifference(path, selectedRemote, selectedBranch);
      setDifference(differ);
      setDetected(true);
    } catch (e) {
      console.error('[error]获取插件更新', e);
      notifications.show({
        title: '获取插件更新失败',
        message: `获取插件 ${name} 更新失败。`,
        color: 'red',
        withCloseButton: false
      });
    } finally {
      setUpdating(false);
    }
  }, [name, path, selectedBranch, selectedRemote]);
  const doUpdate = useCallback(async () => {
    try {
      await Pull(path, selectedRemote);
      const differ = await CheckDifference(path, selectedRemote, selectedBranch);
      setDifference(differ);
      setDetected(true);
    } catch (e) {
      console.error('[error]获取插件更新', e);
      notifications.show({
        title: '获取插件更新失败',
        message: `获取插件 ${name} 更新失败。`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [name, path, selectedBranch, selectedRemote]);

  useMountEffect(() => {
    gitAction.execute();
  });

  return (
    <Paper px="lg" py="md">
      <Stack spacing="md">
        <Flex w="100%" direction="row" justify="space-between" align="center">
          <Box sx={{ flexGrow: 1 }}>
            <Title order={4}>{name}</Title>
          </Box>
          <Box>
            <Text color={StateDisplay[state][0]}>{StateDisplay[state][1]}</Text>
          </Box>
        </Flex>
        <Group spacing="sm" position="right" align="flex-end">
          <Select size="xs" label="远程仓库" value={selectedRemote} data={remotes} />
          <Select size="xs" label="活跃分支" value={selectedBranch} data={branches} />
          {equals(state, '0') ? (
            <Button size="xs" variant="light" onClick={fetchUpdate} disabled={checking}>
              检查更新
            </Button>
          ) : (
            <Button
              size="xs"
              variant="light"
              disabled={equals(state, '1') || updating}
              onClick={doUpdate}
            >
              更新
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};
