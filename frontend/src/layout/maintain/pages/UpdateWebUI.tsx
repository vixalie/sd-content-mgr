import { Flex, Group, Text } from '@mantine/core';
import { FC } from 'react';

export const UpdateWebUI: FC = () => {
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
      <Group spacing="md">
        <Text>远程仓库</Text>
      </Group>
      <Group spacing="md">
        <Text>本地活跃分支</Text>
      </Group>
    </Flex>
  );
};
