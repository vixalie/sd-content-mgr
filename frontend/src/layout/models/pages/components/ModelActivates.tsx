import { ActivatePrompts } from '@/components/ActivatePrompts';
import { PrimaryFileCell } from '@/components/PrimaryFileCell';
import { Box, Flex } from '@mantine/core';
import { FC } from 'react';

type ModelActivatesProps = {
  modelVersionId: number;
  activatePrompts: string[];
};

export const ModelActivates: FC<ModelActivatesProps> = ({ modelVersionId, activatePrompts }) => {
  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="stretch"
      px="5rem"
      py="1rem"
      h="85%"
      sx={{ overflowY: 'auto' }}
    >
      <Box>
        <PrimaryFileCell modelVersionId={modelVersionId} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <ActivatePrompts editable={false} prompts={activatePrompts} />
      </Box>
    </Flex>
  );
};
