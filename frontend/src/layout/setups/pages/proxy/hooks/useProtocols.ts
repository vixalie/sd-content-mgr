import { ProxySetting } from '@/models';
import { SegmentedControlItem } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  GetCurrentProxySetting,
  GetProxyServiceProtocols,
  SaveNewProxySetting
} from '@wails/go/config/ApplicationSettings';
import { equals, keys } from 'ramda';
import { useCallback } from 'react';

export function useProtocols(): SegmentedControlItem[] {
  const { data } = useQuery({
    queryKey: ['proxy-protocols'],
    queryFn: async () => {
      const protocols = await GetProxyServiceProtocols();
      return protocols;
    },
    select: data => {
      let result: SegmentedControlItem[] = [];
      for (const protocol of keys(data)) {
        result.push({ label: protocol, value: data[protocol] });
      }
      return result;
    }
  });

  return data ?? [];
}

export function useProxySetting(): ProxySetting | null | undefined {
  const { data } = useQuery({
    queryKey: ['proxy-protocol-setting'],
    queryFn: async () => {
      return await GetCurrentProxySetting();
    },
    select: data => ({
      mode: data.UseProxy ? 'proxy' : 'direct',
      protocol: data.Protocol,
      host: data.Host,
      port: data.Port,
      username: data.User,
      password: data.Password
    })
  });

  return data;
}

export function usePersistProxySetting(): (formValue: ProxySetting) => Promise<boolean> {
  const persisitHandler = useCallback(async (formValue: ProxySetting) => {
    return await SaveNewProxySetting(
      equals(formValue.mode, 'proxy'),
      formValue.protocol,
      formValue.host ?? '',
      formValue.port ?? 0,
      formValue.username ?? '',
      formValue.password ?? ''
    );
  }, []);

  return persisitHandler;
}
