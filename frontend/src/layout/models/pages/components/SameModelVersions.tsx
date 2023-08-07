import { Box, Paper, Stack, Text } from '@mantine/core';
import { models } from '@wails/go/models';
import { equals } from 'ramda';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';

type SameModelVersionsProps = {
  currentVersionId: number;
  modelVersions?: models.SimplifiedModelVersion[] | null;
};

export const SameModelVersions: FC<SameModelVersionsProps> = ({
  currentVersionId,
  modelVersions
}) => {
  return (
    <Box py="1rem" px="5rem" h="100%" sx={{ overflowY: 'auto' }}>
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
