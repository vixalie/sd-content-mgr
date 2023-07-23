import { ProxySetting } from '@/models';
import {
  Box,
  Button,
  Flex,
  Group,
  NumberInput,
  PasswordInput,
  ScrollArea,
  SegmentedControl,
  Text,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect } from 'react';
import { usePersistProxySetting, useProtocols, useProxySetting } from './hooks/useProtocols';

export function SetupProxy(): FC {
  const queryClient = useQueryClient();
  const protocols = useProtocols();
  const currentSetting = useProxySetting();
  const form = useForm<ProxySetting>({
    initialValues: {
      mode: currentSetting?.mode ?? 'direct',
      protocol: currentSetting?.protocol ?? '',
      host: currentSetting?.host ?? '',
      port: currentSetting?.port ?? 80,
      username: currentSetting?.username ?? '',
      password: currentSetting?.password ?? ''
    }
  });
  const saveProxy = usePersistProxySetting();
  const handleSubmit = useCallback(
    async values => {
      const result = await saveProxy(values);
      if (result) {
        notifications.show({
          title: '保存成功',
          message: '代理设置已保存',
          color: 'green',
          autoClose: 3000,
          withCloseButton: false
        });
        queryClient.invalidateQueries('proxy-protocol-setting');
      } else {
        notifications.show({
          title: '保存失败',
          message: '代理设置保存失败',
          color: 'red',
          autoClose: 3000,
          withCloseButton: false
        });
      }
    },
    [saveProxy]
  );

  useEffect(() => {
    form.setValues({
      mode: currentSetting?.mode ?? 'direct',
      protocol: currentSetting?.protocol ?? '',
      host: currentSetting?.host ?? '',
      port: currentSetting?.port ?? 80,
      username: currentSetting?.username ?? '',
      password: currentSetting?.password ?? ''
    });
  }, [currentSetting]);

  return (
    <Box w="100%" h="100%" px="lg" py="md" sx={{ overflow: 'hidden' }}>
      <ScrollArea h="100%" type="auto">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex direction="column" justify="flex-start" align="stretch" gap="sm">
            <div>
              <Text size="sm" weight={500}>
                使用代理服务
              </Text>
              <SegmentedControl
                data={[
                  { label: '使用代理服务', value: 'proxy' },
                  { label: '使用直接连接', value: 'direct' }
                ]}
                {...form.getInputProps('mode')}
              />
            </div>
            <div>
              <Text size="sm" weight={500}>
                代理协议
              </Text>
              <SegmentedControl data={protocols} {...form.getInputProps('protocol')} />
            </div>
            <TextInput
              label="代理服务地址"
              placeholder="需填入代理地址"
              maw={450}
              {...form.getInputProps('host')}
            />
            <NumberInput
              label="代理服务端口"
              placeholder="需填入代理服务端口"
              min={1}
              max={65535}
              maw={250}
              {...form.getInputProps('port')}
            />
            <TextInput
              label="代理服务登录用户名"
              placeholder="需填入登录代理服务使用的用户名"
              maw={450}
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="代理服务登录密码"
              placeholder="需填入登录代理服务使用的密码"
              maw={450}
              {...form.getInputProps('password')}
            />
            <Group spacing="md" py="sm">
              <Button type="submit" variant="filled">
                保存
              </Button>
            </Group>
          </Flex>
        </form>
      </ScrollArea>
    </Box>
  );
}
