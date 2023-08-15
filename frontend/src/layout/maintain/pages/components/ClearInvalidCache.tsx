import { Button, Flex, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAsync } from '@react-hookz/web';
import { DeleteInvalidCaches } from '@wails/go/models/ModelController';
import { equals } from 'ramda';
import { FC } from 'react';

export const ClearInvalidCache: FC = () => {
  const [state, { execute }] = useAsync(async () => {
    try {
      await DeleteInvalidCaches();
      notifications.show({
        title: '清理成功',
        message: '无效的文件缓存记录已经清理完成。',
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]清理重复文件记录：', e);
      notifications.show({
        title: '清理失败',
        message: `无效的文件缓存记录清理失败，${e}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, []);

  return (
    <Flex direction="column" justify="flex-start" align="flex-start" gap="sm" h="100%">
      <Group spacing="sm" sx={{ minHeight: 'max-content' }}>
        <Button
          variant="filled"
          color="blue"
          onClick={execute}
          loading={equals(state.status, 'loading')}
        >
          扫描并清理无效缓存
        </Button>
      </Group>
    </Flex>
  );
};
