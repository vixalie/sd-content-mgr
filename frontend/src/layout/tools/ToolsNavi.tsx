import { ActivatableNavLink } from '@/components/ActivatableNavLink';
import { Stack } from '@mantine/core';

export function ToolsNavigation() {
  return (
    <Stack spacing="sm">
      <ActivatableNavLink to="/tools/prompt" label="提示词组装工具" disabled />
    </Stack>
  );
}
