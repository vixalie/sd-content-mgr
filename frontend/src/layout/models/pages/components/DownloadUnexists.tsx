import { DownloadProgress } from '@/components/DownloadProgress';
import { MoldelSelections } from '@/constants/models';
import {
  Badge,
  Box,
  Button,
  Group,
  Select,
  Stack,
  TextInput,
  useMantineTheme
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  BreakModelVersionFile,
  CheckFileNameExists,
  CheckModelVersionPrimaryFileSize,
  GetModelSubCategoryDirs
} from '@wails/go/models/ModelController';
import { isEmpty, isNil, toLower } from 'ramda';
import { FC, useCallback, useMemo, useState } from 'react';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

const hostPathSelection: string = '/';

type DownloadUnexistsProps = {
  modelVersionId: number;
  modelId: number;
  modelType: string;
};

export const DownloadUnexists: FC<DownloadUnexistsProps> = ({
  modelVersionId,
  modelId,
  modelType
}) => {
  const theme = useMantineTheme();
  const operatesHeight = useCachedModelMeasure(infoZoneHeightSelector());
  const [lockdown, setLockdown] = useState<boolean>(false);
  const modelCategory = useMemo(() => toLower(modelType), [modelType]);
  const [targetSubPath, setTargetSubPath] = useState<string>('');
  const [modelFileName, setModelFileName] = useState<string>('');
  const [modelFileExt, setModelFileExt] = useState<string>('');
  const lock = useCallback(() => setLockdown(true), []);
  const unlock = useCallback(() => setLockdown(false), []);

  const { data: modelCatePath } = useQuery({
    queryKey: ['model-target-cate', 'webui', modelCategory],
    initialData: [],
    enabled: !isNil(modelCategory) && !isEmpty(modelCategory),
    queryFn: async ({ queryKey }) => {
      const [_, ui, category] = queryKey;
      const data = await GetModelSubCategoryDirs(ui, category);
      return data;
    },
    select: data => [hostPathSelection, ...(data ?? [])]
  });
  const { data: totalSize } = useQuery({
    queryKey: ['unexists-version-file-size', modelVersionId],
    enabled: !isNil(modelVersionId) && !isEmpty(modelVersionId),
    queryFn: async ({ queryKey }) => {
      const [_, versionId] = queryKey;
      const data = await CheckModelVersionPrimaryFileSize(versionId);
      return data;
    }
  });
  useQuery({
    queryKey: ['unexists-version-filename', modelVersionId],
    enabled: !isNil(modelVersionId) && !isEmpty(modelVersionId),
    queryFn: async ({ queryKey }) => {
      const [_, versionId] = queryKey;
      const [name, ext] = await BreakModelVersionFile(versionId);
      setModelFileName(name);
      setModelFileExt(ext);
      return;
    }
  });
  const { data: modelFileExists } = useQuery({
    queryKey: [
      'unexists-version-new-filename-check',
      'webui',
      targetSubPath,
      modelVersionId,
      modelFileName
    ],
    enabled:
      !isNil(modelVersionId) &&
      !isEmpty(modelVersionId) &&
      !isEmpty(modelFileName) &&
      !isEmpty(targetSubPath),
    initialData: false,
    queryFn: async ({ queryKey }) => {
      const [_, ui, subPath, versionId, fileName] = queryKey;
      const data = await CheckFileNameExists(ui, subPath, versionId, fileName);
      return data;
    }
  });

  return (
    <Stack py="1rem" px="5rem" h={operatesHeight}>
      <Group spacing="sm" align="flex-end">
        <Select
          label="模型类别"
          readOnly
          disabled={lockdown}
          data={MoldelSelections}
          value={modelCategory}
        />
        <Select
          disabled={lockdown}
          label="目标分类目录"
          data={modelCatePath}
          value={targetSubPath}
          onChange={setTargetSubPath}
        />
        <Button variant="filled">下载</Button>
      </Group>
      <Group spacing="sm" w="100%">
        <TextInput
          label="下载文件名"
          value={modelFileName}
          onChange={event => setModelFileName(event.currentTarget.value)}
          rightSection={<Badge color="gray">{modelFileExt}</Badge>}
          rightSectionWidth={120}
          disabled={lockdown}
          sx={{ flexGrow: 1 }}
        />
        <Box sx={{ alignSelf: 'flex-end' }}>
          {modelFileExists ? (
            <Tooltip label="指定文件名的文件在目标文件夹中已经存在！">
              <IconAlertTriangle stroke={1} color={theme.colors.red[6]} />
            </Tooltip>
          ) : (
            <IconAlertTriangle stroke={1} color={theme.colors.cfg[3]} size={24} />
          )}
        </Box>
      </Group>
      <DownloadProgress
        modelVersion={modelVersionId}
        total={totalSize}
        lock={lock}
        unlock={unlock}
      />
    </Stack>
  );
};
