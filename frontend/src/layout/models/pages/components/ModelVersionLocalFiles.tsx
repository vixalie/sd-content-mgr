import { Group, Loader, Stack, Text, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FetchModelLocalFiles } from '@wails/go/models/ModelController';
import { nanoid } from 'nanoid';
import { FC } from 'react';

type ModelVersionLocalFilesProps = {
  versionId: number;
};

export const ModelVersionLocalFiles: FC<ModelVersionLocalFilesProps> = ({ versionId }) => {
  const { data: files, isFetching } = useQuery({
    queryKey: ['model-local-files', versionId],
    queryFn: async ({ queryKey }) => {
      const [_, versionId] = queryKey;
      return await FetchModelLocalFiles(versionId);
    }
  });
  console.log('[debug]local files: ', files);
  return (
    <Stack spacing="sm">
      {isFetching && (
        <Group>
          <Loader />
          <Text>加载中……</Text>
        </Group>
      )}
      {(files ?? []).map(file => (
        <Tooltip label={file.name} key={nanoid()}>
          <Text fz="sm" w="100%" maw={250} truncate align="right">
            {file.name}
          </Text>
        </Tooltip>
      ))}
    </Stack>
  );
};
