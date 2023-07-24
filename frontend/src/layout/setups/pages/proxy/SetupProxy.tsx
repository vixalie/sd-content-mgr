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
  SegmentedControlItem,
  Text,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FC, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { usePersistProxySetting } from './hooks/useProtocols';

export function SetupProxy(): FC {
  const [protocols, currentSetting] = useLoaderData<[SegmentedControlItem[], ProxySetting]>();
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
  const handleSubmit = usePersistProxySetting();

  useEffect(() => {
    form.setValues({
      mode: currentSetting?.mode ?? 'direct',
      protocol: currentSetting?.protocol ?? '',
      host: currentSetting?.host ?? '',
      port: currentSetting?.port ?? 80,
      username: currentSetting?.username ?? '',
      password: currentSetting?.password ?? ''
    });
  }, []);
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
