import { MoldelSelections } from '@/constants/models';
import { Select } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { GetModelSubCategoryDirs } from '@wails/go/models/ModelController';
import { isEmpty, isNil } from 'ramda';
import { FC } from 'react';
import { useDownloadState } from '../states/download-state';

const hostPathSelection: string = '/';

type DownloadSetupProps = {};

export const DownloadSetup: FC<DownloadSetupProps> = ({}) => {
  const [
    lockdown,
    modelCategory,
    targetSubPath,
    setTargetSubPath,
    selectedVersion,
    setSelectedVersion,
    availableVersions
  ] = useDownloadState(st => [
    st.lockdown,
    st.category,
    st.subPath,
    st.setSubPath,
    st.selectedVersion,
    st.setSelectedVersion,
    st.availableVersions
  ]);
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

  return (
    <>
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
      <Select
        disabled={lockdown}
        label="模型版本"
        value={selectedVersion}
        onChange={setSelectedVersion}
        data={availableVersions}
      />
    </>
  );
};
