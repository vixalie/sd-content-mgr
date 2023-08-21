import { ActivatableNavLink } from '@/components/ActivatableNavLink';
import { Stack } from '@mantine/core';

export function MaintainNavigation() {
  return (
    <Stack spacing="sm">
      <ActivatableNavLink to="/maintain/download" label="下载模型" />
      <ActivatableNavLink to="/maintain/scan" label="扫描模型" />
      <ActivatableNavLink to="/maintain/cleanup" label="清理模型" />
      <ActivatableNavLink to="/maintain/refresh" label="更新模型信息" disabled />
      <ActivatableNavLink to="/maintain/update/webui" label="SD WebUI 更新" />
      <ActivatableNavLink to="/maintain/update/webui-extension" label="SD WebUI 插件管理" />
      <ActivatableNavLink to="/maintain/update/comfy" label="SD ComfyUI 更新" />
      <ActivatableNavLink to="/maintain/update/comfy-nodes" label="SD ComfyUI 节点管理" disabled />
    </Stack>
  );
}
