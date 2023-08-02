import { RenameableFile } from '@/components/RenameableFile';
import { Stack } from '@mantine/core';
import { FetchModelLocalFiles } from '@wails/go/models/ModelController';
import { nanoid } from 'nanoid';
import { FC } from 'react';
import usePromise from 'react-promise-suspense';

type ModelVersionLocalFilesProps = {
  versionId: number;
};

export const ModelVersionLocalFiles: FC<ModelVersionLocalFilesProps> = ({ versionId }) => {
  const files = usePromise(FetchModelLocalFiles, [versionId]);
  return (
    <Stack spacing="sm">
      {files.map(file => (
        <RenameableFile key={nanoid()} fileId={file.id} fileName={file.fileName} fz="sm" w="70%" />
      ))}
    </Stack>
  );
};
