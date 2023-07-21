import { NavLink, Stack } from '@mantine/core';

export function MaintainNavigation() {
  return (
    <Stack spacing="sm">
      <NavLink label="下载模型" />
      <NavLink label="补录模型信息" />
      <NavLink label="更新模型信息" />
      <NavLink label="清理模型" />
    </Stack>
  );
}
