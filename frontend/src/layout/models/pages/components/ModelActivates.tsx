import { ActivatePrompts } from '@/components/ActivatePrompts';
import { PrimaryFileCell } from '@/components/PrimaryFileCell';
import { Box, ScrollArea, Stack } from '@mantine/core';
import { FC } from 'react';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

type ModelActivatesProps = {
  modelVersionId: number;
  activatePrompts: string[];
};

export const ModelActivates: FC<ModelActivatesProps> = ({ modelVersionId, activatePrompts }) => {
  const activatesHeight = useCachedModelMeasure(infoZoneHeightSelector());
  return (
    <Box px="5rem" py="1rem" h={activatesHeight} component={ScrollArea}>
      <Stack spacing="md" align="stretch">
        <Box>
          <PrimaryFileCell modelVersionId={modelVersionId} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <ActivatePrompts editable={false} prompts={activatePrompts} />
        </Box>
      </Stack>
    </Box>
  );
};
