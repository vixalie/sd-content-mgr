import { ActivatePrompts } from '@/components/ActivatePrompts';
import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import { Grid, ScrollArea, Stack } from '@mantine/core';
import { entities } from '@wails/go/models';
import { FC } from 'react';
import { ImageSlide } from './ModelImage';

type ModelSummaryProps = {
  modelVersion: entities.ModelVersion;
};

export const ModelSummay: FC<ModelSummaryProps> = ({ modelVersion }) => {
  return (
    <Grid gutter="md" h="100%">
      <Grid.Col span={7} h="100%" p="md">
        <ImageSlide images={modelVersion.covers} />
      </Grid.Col>
      <Grid.Col span={5} h="100%">
        <ScrollArea>
          <Stack spacing="md">
            <TwoLineInfoCell title="基础模型" level={5}>
              {modelVersion.baseModel ?? '未知'}
            </TwoLineInfoCell>
            <ActivatePrompts editable={false} prompts={modelVersion.activatePrompt} />
          </Stack>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};
