import { Box, Button, ScrollArea, Stack } from '@mantine/core';
import { FC } from 'react';
import { useUpdateModel } from '../../hooks/useUpdateModel';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

type ModelOperatesProps = {
  modelVersionId: number;
  modelId: number;
};

export const ModelOperates: FC<ModelOperatesProps> = ({ modelVersionId, modelId }) => {
  const operatesHeight = useCachedModelMeasure(infoZoneHeightSelector());
  const refreshModelInfo = useUpdateModel(modelId);
  return (
    <Box py="1rem" px="5rem" h={operatesHeight} component={ScrollArea}>
      <Stack spacing="md" align="stretch">
        <Button variant="light" color="blue" onClick={refreshModelInfo}>
          刷新模型信息
        </Button>
        <Button variant="light" color="red">
          删除当前模型版本
        </Button>
      </Stack>
    </Box>
  );
};
