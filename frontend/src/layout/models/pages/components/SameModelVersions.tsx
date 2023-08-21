import { Box, Paper, ScrollArea, Stack, Text } from '@mantine/core';
import { models } from '@wails/go/models';
import { equals } from 'ramda';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

type SameModelVersionsProps = {
  currentVersionId: number;
  modelVersions?: models.SimplifiedModelVersion[] | null;
};

export const SameModelVersions: FC<SameModelVersionsProps> = ({
  currentVersionId,
  modelVersions
}) => {
  const versionsHeight = useCachedModelMeasure(infoZoneHeightSelector());
  return (
    <Box py="1rem" px="5rem" h={versionsHeight} component={ScrollArea}>
      <Stack spacing="md" align="stretch">
        {(modelVersions ?? []).map(version => {
          return (
            <Paper p="md" shadow="sm" key={version.id}>
              {equals(version.id, currentVersionId) ? (
                <Text color="yellow">{version.versionName}</Text>
              ) : (
                <NavLink to={`/model/version/${version.id}`}>
                  <Text>{version.versionName}</Text>
                </NavLink>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};
