import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import { Badge, Grid, ScrollArea, Stack } from '@mantine/core';
import { entities } from '@wails/go/models';
import { isNil } from 'ramda';
import { FC } from 'react';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';
import { ImageSlide } from './ModelImage';
import { ModelVersionLocalFiles } from './ModelVersionLocalFiles';

type ModelSummaryProps = {
  modelVersion: entities.ModelVersion;
};

export const ModelSummay: FC<ModelSummaryProps> = ({ modelVersion }) => {
  const summaryHeight = useCachedModelMeasure(infoZoneHeightSelector());
  return (
    <Grid gutter="md" h={summaryHeight}>
      <Grid.Col span={7} h={summaryHeight} p="md">
        <ImageSlide images={modelVersion.covers} currentCover={modelVersion.coverUsed} />
      </Grid.Col>
      <Grid.Col span={5} h={summaryHeight}>
        <ScrollArea h={summaryHeight}>
          <Stack spacing="md">
            <TwoLineInfoCell title="类型" level={5}>
              {modelVersion.model?.type ?? '未知'}
            </TwoLineInfoCell>
            <TwoLineInfoCell title="基础模型" level={5}>
              {modelVersion.baseModel ?? '未知'}
            </TwoLineInfoCell>
            <TwoLineInfoCell title="分级" level={5}>
              {isNil(modelVersion.model) ? (
                <Badge color="yellow">未知</Badge>
              ) : modelVersion.model.nsfw ? (
                <Badge color="red">NSFW</Badge>
              ) : (
                <Badge color="green">SFW</Badge>
              )}
            </TwoLineInfoCell>
            <TwoLineInfoCell title="模型包含文件" level={5}>
              <ModelVersionLocalFiles versionId={modelVersion.id} />
            </TwoLineInfoCell>
          </Stack>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};
