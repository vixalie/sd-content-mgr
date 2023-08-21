import { Button, Flex, Group, Select, Text } from '@mantine/core';
import { config } from '@wails/go/models';
import { equals, isEmpty, not } from 'ramda';
import { FC, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useUpdateWebUI } from './states/update-webui';

export const UpdateWebUI: FC = () => {
  const settings: config.A111StableDiffusionWebUIConfig = useLoaderData();
  const [
    remotes,
    selectedRemote,
    activeRemote,
    loadRemotes,
    branches,
    selectedBranch,
    activeBranch,
    loadBranches,
    difference,
    refreshDifference,
    fetchUpdates,
    checkout,
    doUpdate
  ] = useUpdateWebUI(state => [
    state.remotes,
    state.selectedRemote,
    state.activeRemote,
    state.loadRemotes,
    state.branches,
    state.selectedBranch,
    state.activeBranch,
    state.loadBranches,
    state.difference,
    state.refreshDifference,
    state.fetchUpdates,
    state.checkoutBranch,
    state.doUpdate
  ]);

  useEffect(() => {
    loadRemotes(settings.basePath);
    loadBranches(settings.basePath);
  }, [settings, loadRemotes]);
  useEffect(() => {
    if (not(isEmpty(selectedBranch)) && not(isEmpty(selectedRemote))) {
      refreshDifference(settings.basePath);
    }
  }, [settings, selectedBranch, selectedRemote]);

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="flex-start"
      gap="md"
      px="md"
      py="lg"
      h="100vh"
    >
      <Group spacing="md" align="flex-end">
        <Select label="远程仓库" value={selectedRemote} data={remotes} />
        <Button variant="light" onClick={() => fetchUpdates(settings.basePath)}>
          获取更新
        </Button>
      </Group>
      <Group spacing="md" align="flex-end">
        <Select label="本地活跃分支" value={selectedBranch} data={branches} />
        <Button
          variant="light"
          disabled={equals(selectedBranch, activeBranch)}
          onClick={() => checkout(settings.basePath)}
        >
          切换分支
        </Button>
        <Button
          variant="light"
          disabled={equals(difference, 0)}
          onClick={() => doUpdate(settings.basePath)}
        >
          部署更新
        </Button>
      </Group>
      <Group spacing="md" align="flex-end">
        <Text>当前版本状态：</Text>
        {equals(difference, 0) ? (
          <Text color="green">已是最新</Text>
        ) : (
          <Text color="red">落后 {difference} 个提交</Text>
        )}
      </Group>
    </Flex>
  );
};
