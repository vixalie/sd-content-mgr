import { NavLink, Stack } from '@mantine/core';

export function SetupNavigation() {
  return (
    <Stack spacing="sm">
      <NavLink label="应用配置" disabled />
      <NavLink label="Civitai API 配置" disabled />
      <NavLink label="网络代理配置" />
      <NavLink label="SD WebUI 配置" />
      <NavLink label="SD ComfyUI 配置" />
    </Stack>
  );
}
