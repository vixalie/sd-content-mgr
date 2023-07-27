import { MoldelSelections } from '@/constants/models';
import { Box, Select, Stack, TextInput } from '@mantine/core';
import { useDebouncedState, useUncontrolled } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { models } from '@wails/go/models';
import { GetModelSubCategoryDirs, ListModelFiles } from '@wails/go/models/ModelController';
import { EventsOff, EventsOn } from '@wails/runtime';
import { isNil } from 'ramda';
import { useEffect, useState } from 'react';
import { ModelListItem } from './components/ModelListItem';

const hostPathSelection: string = '/';

export function ModelSelection() {
  const [modelCatePath, setModelCatePath] = useState<string[]>([hostPathSelection]);
  const [uiTools, setUITools] = useUncontrolled({
    defaultValue: 'webui'
  });
  const [modelCategory, setModelCategory] = useUncontrolled<string | undefined>({
    defaultValue: undefined
  });
  const [modelSubPath, setModelSubPath] = useUncontrolled<string>({
    defaultValue: '/'
  });
  const [keyword, setKeyword] = useDebouncedState('', 500);
  const [modelList, setModelList] = useState<models.SimpleModelDescript[]>([]);
  useQuery({
    queryKey: ['model-sub-cate', uiTools, modelCategory],
    enabled: !isNil(modelCategory),
    queryFn: async () => {
      try {
        const dirs = await GetModelSubCategoryDirs(uiTools, modelCategory);
        setModelCatePath([hostPathSelection, ...(dirs ?? [])]);
        setModelSubPath(hostPathSelection);
        return dirs;
      } catch (e) {
        console.error(e);
        notifications.show({
          message: '未能扫描指定模型目录！',
          color: 'red',
          autoClose: 3000,
          withCloseButton: false
        });
      }
    }
  });
  useQuery({
    queryKey: ['model-sub-cate', uiTools, modelCategory, modelSubPath, keyword],
    enabled: !isNil(modelCategory) && !isNil(modelSubPath),
    queryFn: async () => {
      try {
        const modelList = await ListModelFiles(uiTools, modelCategory, modelSubPath, keyword);
        setModelList(modelList);
      } catch (e) {
        console.error('列举模型列表出错：', e);
        notifications.show({
          message: `列举模型列表出错！${e}`,
          color: 'red',
          autoClose: 3000,
          withCloseButton: false
        });
      }
    }
  });

  useEffect(() => {
    EventsOn('scanUncachedFiles', msg => console.log('Scan Uncached: ', msg));
    return () => EventsOff('scanUncachedFiles');
  }, []);

  return (
    <Stack spacing="sm" h="inherit">
      <Select
        label="UI工具"
        placeholder="选择要管理的UI工具"
        value={uiTools}
        onChange={setUITools}
        data={[
          { label: 'SD WebUI', value: 'webui' },
          { label: 'SD ComfyUI', value: 'comfyui' }
        ]}
      />
      <Select
        label="模型类别"
        placeholder="选择一个模型类别"
        value={modelCategory}
        onChange={setModelCategory}
        data={MoldelSelections}
      />
      <Select
        label="模型分类目录"
        placeholder="选择一个模型存放目录"
        value={modelSubPath}
        onChange={setModelSubPath}
        data={modelCatePath}
      />
      <TextInput
        label="检索模型名称"
        placeholder="输入模型检索词以检索"
        value={keyword}
        onChange={event => setKeyword(event.currentTarget.value)}
      />
      <Box w="100%" sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Stack spacing="md">
          {modelList.map(model => (
            <ModelListItem item={model} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
