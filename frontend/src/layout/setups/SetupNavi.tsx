import { Stack } from '@mantine/core';
import { ActivatableNavLink } from '../../components/ActivatableNavLink';

export function SetupNavigation() {
  return (
    <Stack spacing="sm">
      <ActivatableNavLink to="/setup/app" label="应用配置" disabled />
      <ActivatableNavLink to="/setup/civitai" label="Civitai API 配置" disabled />
      <ActivatableNavLink to="/setup/proxy" label="网络代理配置" />
      <ActivatableNavLink to="/setup/webui" label="SD WebUI 配置" />
      <ActivatableNavLink to="/setup/comfy" label="SD ComfyUI 配置" />
    </Stack>
  );
}
