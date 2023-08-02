import { ActivatePrompts } from '@/components/ActivatePrompts';
import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import { Grid, ScrollArea, Stack } from '@mantine/core';
import { entities } from '@wails/go/models';
import { FC, Suspense } from 'react';
import { ImageSlide } from './ModelImage';
import { ModelVersionLocalFiles } from './ModelVersionLocalFiles';

type ModelSummaryProps = {
  modelVersion: entities.ModelVersion;
};

export const ModelSummay: FC<ModelSummaryProps> = ({ modelVersion }) => {
  return (
    <Grid gutter="md" h="100%">
      <Grid.Col span={7} h="100%" p="md">
        <ImageSlide images={modelVersion.covers} currentCover={modelVersion.coverUsed} />
      </Grid.Col>
      <Grid.Col span={5} h="100%">
        <ScrollArea>
          <Stack spacing="md">
            <TwoLineInfoCell title="基础模型" level={5}>
              {modelVersion.baseModel ?? '未知'}
            </TwoLineInfoCell>
            <ActivatePrompts editable={false} prompts={modelVersion.activatePrompt} />
            <TwoLineInfoCell title="模型文件名" level={5}>
              <Suspense fallback="加载中...">
                <ModelVersionLocalFiles versionId={modelVersion.id} />
              </Suspense>
            </TwoLineInfoCell>
          </Stack>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};
