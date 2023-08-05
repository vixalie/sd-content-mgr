import { Box, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FetchSameSerialVersions } from '@wails/go/models/ModelController';
import { equals, isEmpty, isNil, not } from 'ramda';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';

type SameModelVersionsProps = {
  modelVersionId: number;
};

export const SAmeModelVersions: FC<SameModelVersionsProps> = ({ modelVersionId }) => {
  const {
    data: versions,
    isFetching,
    isFetched
  } = useQuery({
    queryKey: ['model-silbing-versions', modelVersionId],
    queryFn: async ({ queryKey }) => {
      const [_, modelVersionId] = queryKey;
      const versions = await FetchSameSerialVersions(modelVersionId);
      return versions;
    }
  });
  return (
    <Box py="1rem" px="5rem" h="100%" sx={{ overflowY: 'auto' }}>
      <Stack spacing="md" align="stretch">
        {isFetching && (
          <Paper p="md" shadow="sm">
            <Group>
              <Loader />
              <Text>加载中……</Text>
            </Group>
          </Paper>
        )}
        {isFetched && (isNil(versions) || isEmpty(versions)) && (
          <Paper p="md" shadow="sm">
            <Text color="red">模型不具备同系列版本。</Text>
          </Paper>
        )}
        {isFetched &&
          not(isNil(versions)) &&
          not(isEmpty(versions)) &&
          (versions ?? []).map(version => {
            return (
              <Paper p="md" shadow="sm" key={version.id}>
                {equals(version.id, modelVersionId) ? (
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
