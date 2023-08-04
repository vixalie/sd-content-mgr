import { RenameableFile } from '@/components/RenameableFile';
import { Group, Loader, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FetchModelLocalFiles } from '@wails/go/models/ModelController';
import { nanoid } from 'nanoid';
import { FC } from 'react';

type ModelVersionLocalFilesProps = {
  versionId: number;
};

export const ModelVersionLocalFiles: FC<ModelVersionLocalFilesProps> = ({ versionId }) => {
  const { data: files, isLoading } = useQuery({
    queryKey: ['model-local-files', versionId],
    queryFn: async ({ queryKey }) => {
      const [_, versionId] = queryKey;
      return await FetchModelLocalFiles(versionId);
    }
  });
  return (
    <Stack spacing="sm">
      {isLoading && (
        <Group>
          <Loader />
          <Text>加载中……</Text>
        </Group>
      )}
      {(files ?? []).map(file => (
        <RenameableFile key={nanoid()} fileId={file.id} fileName={file.fileName} fz="sm" w="70%" />
      ))}
    </Stack>
  );
};
