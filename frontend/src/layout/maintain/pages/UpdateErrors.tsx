import { Flex, Title } from '@mantine/core';
import { FC } from 'react';
import { useAsyncError } from 'react-router-dom';

export const UpdateErrors: FC = () => {
  const error = useAsyncError();
  console.log('[error]内容更新：', error);
  return (
    <Flex h="100vh" w="100%" justify="center" align="center">
      <Title order={3}>加载待更新内容出现错误</Title>
    </Flex>
  );
};
