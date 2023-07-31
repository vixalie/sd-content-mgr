import { MoldelSelections } from '@/constants/models';
import { ActionIcon, Box, Select, Stack, TextInput } from '@mantine/core';
import { useDebouncedValue, useUncontrolled } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { models } from '@wails/go/models';
import { GetModelSubCategoryDirs, ListModelFiles } from '@wails/go/models/ModelController';
import { EventsOff, EventsOn } from '@wails/runtime';
import { isEmpty, isNil, prop, props, sortBy } from 'ramda';
import { useEffect, useState } from 'react';
import { ModelListItem } from './components/ModelListItem';

const hostPathSelection: string = '/';
const sortByName = sortBy(prop('name'));

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
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword] = useDebouncedValue(keyword, 500);
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
      return [];
    }
  });
  useQuery({
    queryKey: ['model-cate-list', uiTools, modelCategory, modelSubPath, debouncedKeyword],
    enabled: !isNil(modelCategory) && !isNil(modelSubPath),
    queryFn: async () => {
      try {
        setModelList([]);
        const modelList = await ListModelFiles(
          uiTools,
          modelCategory,
          modelSubPath,
          debouncedKeyword
        );
        setModelList(sortByName(modelList));
      } catch (e) {
        console.error('列举模型列表出错：', e);
        notifications.show({
          message: `列举模型列表出错！${e}`,
          color: 'red',
          autoClose: 3000,
          withCloseButton: false
        });
      }
      return [];
    }
  });

  useEffect(() => {
    EventsOn('scanUncachedFiles', msg => {
      switch (prop('state', msg)) {
        case 'start':
          notifications.show({
            id: 'uncached-files-scan',
            title: '正在扫描模型',
            message: `正在扫描未缓存的模型文件。总数：${prop('amount', msg)}`,
            autoClose: false,
            withCloseButton: false,
            loading: true,
            color: 'blue'
          });
          break;
        case 'progress':
          break;
        case 'finish':
          notifications.update({
            id: 'uncached-files-scan',
            title: '扫描完成',
            message: `已经完成未扫描模型文件的扫描。`,
            autoClose: 3000,
            withCloseButton: false,
            loading: false,
            color: 'green'
          });
          break;
        case 'error':
          console.error('[error]模型扫描出现错误：', props('message', msg), props('error', msg));
          break;
      }
    });
    return () => {
      EventsOff('scanUncachedFiles');
    };
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
        rightSection={
          !isEmpty(keyword) && (
            <ActionIcon onClick={() => setKeyword('')} variant="transparent">
              <IconX stroke={1} size="0.8rem" />
            </ActionIcon>
          )
        }
      />
      <Box w="100%" sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Stack spacing="md">
          {modelList.map(model => (
            <ModelListItem
              item={model}
              to={
                model.related
                  ? `/model/version/${model.relatedVersion}`
                  : `/model/uncached/${model.id}`
              }
              key={model.id}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
