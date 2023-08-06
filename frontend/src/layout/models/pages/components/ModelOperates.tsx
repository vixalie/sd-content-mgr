import { Box, Button, Stack } from '@mantine/core';
import { FC } from 'react';
import { useUpdateModel } from '../../hooks/useUpdateModel';

type ModelOperatesProps = {
  modelVersionId: number;
  modelId: number;
};

export const ModelOperates: FC<ModelOperatesProps> = ({ modelVersionId, modelId }) => {
  const refreshModelInfo = useUpdateModel(modelId);
  return (
    <Box py="1rem" px="5rem" h="100%" sx={{ overflowY: 'auto' }}>
      <Stack spacing="md" align="stretch">
        <Button variant="light" color="blue" onClick={refreshModelInfo}>
          刷新模型信息
        </Button>
      </Stack>
    </Box>
  );
};
