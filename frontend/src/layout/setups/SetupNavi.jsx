import { NavLink, Stack } from '@mantine/core';

export function SetupNavigation() {
  return (
    <Stack spacing="sm">
      <NavLink label="应用配置" />
      <NavLink label="Civitai API 配置" />
      <NavLink label="网络代理配置" />
      <NavLink label="Stable Diffusion WebUI 配置" />
      <NavLink label="ComfyUI 配置" />
    </Stack>
  );
}
