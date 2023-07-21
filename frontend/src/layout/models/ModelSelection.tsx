import { Box, ScrollArea, Select, Stack, TextInput } from '@mantine/core';
import { MoldelSelections } from '../../constants/models';

export function ModelSelection() {
  return (
    <Stack spacing="sm" h="inherit">
      <Select label="模型类别" placeholder="选择一个模型类别" data={MoldelSelections} />
      <TextInput label="检索模型名称" placeholder="输入模型检索词以检索" />
      <Box sx={{ flexGrow: 1 }}>
        <ScrollArea />
      </Box>
    </Stack>
  );
}
