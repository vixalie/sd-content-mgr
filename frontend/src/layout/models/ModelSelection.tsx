import { MoldelSelections } from '@/constants/models';
import { Box, ScrollArea, Select, Stack, TextInput } from '@mantine/core';

export function ModelSelection() {
  return (
    <Stack spacing="sm" h="inherit">
      <Select
        label="UI工具"
        placeholder="选择要管理的UI工具"
        defaultValue="webui"
        data={[
          { label: 'SD WebUI', value: 'webui' },
          { label: 'SD ComfyUI', value: 'comfyui' }
        ]}
      />
      <Select label="模型类别" placeholder="选择一个模型类别" data={MoldelSelections} />
      <Select
        label="模型分类目录"
        placeholder="选择一个模型存放目录"
        data={[{ label: '/', value: '/' }]}
      />
      <TextInput label="检索模型名称" placeholder="输入模型检索词以检索" />
      <Box sx={{ flexGrow: 1 }}>
        <ScrollArea />
      </Box>
    </Stack>
  );
}
