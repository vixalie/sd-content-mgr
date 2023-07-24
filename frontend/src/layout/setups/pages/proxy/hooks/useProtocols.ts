import { ProxySetting } from '@/models';
import { SegmentedControlItem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  GetCurrentProxySetting,
  GetProxyServiceProtocols,
  SaveNewProxySetting
} from '@wails/go/config/ApplicationSettings';
import { equals, keys } from 'ramda';
import { useCallback } from 'react';
import { useRevalidator } from 'react-router-dom';

export async function loadProxyConfigData(): Promise<[SegmentedControlItem[], ProxySetting]> {
  const protocols = await GetProxyServiceProtocols();
  const setting = await GetCurrentProxySetting();
  return [
    keys(protocols).map(key => ({ label: key, value: protocols[key] })),
    {
      mode: setting.useProxy ? 'proxy' : 'direct',
      protocol: setting.protocol,
      host: setting.host,
      port: setting.port,
      username: setting.user,
      password: setting.password
    }
  ];
}

export function usePersistProxySetting(): (formValue: ProxySetting) => Promise<boolean> {
  const revalidator = useRevalidator();
  const persisitHandler = useCallback(async (formValue: ProxySetting) => {
    const result = await SaveNewProxySetting(
      equals(formValue.mode, 'proxy'),
      formValue.protocol,
      formValue.host ?? '',
      formValue.port ?? 0,
      formValue.username ?? '',
      formValue.password ?? ''
    );
    if (result) {
      notifications.show({
        title: '保存成功',
        message: '代理设置已保存',
        color: 'green',
        autoClose: 3000,
        withCloseButton: false
      });
      revalidator.revalidate();
    } else {
      notifications.show({
        title: '保存失败',
        message: '代理设置保存失败',
        color: 'red',
        autoClose: 3000,
        withCloseButton: false
      });
    }
  }, []);

  return persisitHandler;
}
