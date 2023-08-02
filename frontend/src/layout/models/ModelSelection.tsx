import { MoldelSelections } from '@/constants/models';
import { ActionIcon, Box, Group, Loader, Select, Stack, Text, TextInput, useMantineTheme } from '@mantine/core';
import { useDebouncedValue, useUncontrolled } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAsync } from '@react-hookz/web';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';
import { models } from '@wails/go/models';
import { GetModelSubCategoryDirs, ListModelFiles } from '@wails/go/models/ModelController';
import { EventsOff, EventsOn } from '@wails/runtime';
import { equals, isEmpty, isNil, prop, props, sortBy } from 'ramda';
import { FC, useEffect, useState } from 'react';
import { ModelListItem } from './components/ModelListItem';

const hostPathSelection: string = '/';
const sortByName = sortBy(prop('name'));

const ModelListLoader: FC<{ui: string; cate?: string; subPath?: string; keyword?: string}> = ({ui, cate, subPath, keyword}) => {
  const theme = useMantineTheme();
  const [listState, listActions] = useAsync(async ({ui, cate, subPath, keyword}) => {
    console.log('[debug]cate list: ', ui, cate, subPath, keyword);
    if (!isNil(cate) && !isNil(subPath)) {
        const modelList = await ListModelFiles(
          ui,
          cate,
          subPath,
          keyword
        );
        return sortByName(modelList);
    }
  }, []);
  useEffect(() => {
    listActions.execute({ui, cate, subPath, keyword});
  }, [ui, cate, subPath, keyword]);
  useEffect(() => {
    EventsOn('updateModelList', () => {
      listActions.execute({ui, cate, subPath, keyword});
    });
    return () => {
      EventsOff('updateModelList');
    }
  }, []);

  return (
    <>
      {equals('loading', prop('status', listState)) && (<Group spacing="sm">
          <Loader />
          <Text>正在加载模型列表...</Text>
        </Group>)}
        {equals('error', prop('status', listState)) && (<Group spacing="sm">
          <IconAlertTriangle stroke={1} size={32} color={theme.colors.red[6]} />
          <Text>未能成功加载模型列表。</Text>
        </Group>)}
        {equals('success', prop('status', listState)) && (listState.result ?? []).map(model => (
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
    </>
  );
}

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
  const [catePathState, catePathActions] = useAsync(async (ui: string, category?: string) => {
    if (!isNil(category)) {
      return await GetModelSubCategoryDirs(ui, category);
    }
  });
  useEffect(() => {
    catePathActions.execute(uiTools, modelCategory);
  }, [uiTools, modelCategory]);
  useEffect(() => {
    switch (prop('status', catePathState)) {
    case 'success':
      setModelCatePath([hostPathSelection, ...(catePathState.result ?? [])]);
      setModelSubPath(hostPathSelection);
      break;
    case 'error':
      console.error('获取模型分类目录出错：', catePathState.error);
      notifications.show({
        message: '未能扫描指定模型目录！',
        color: 'red',
        autoClose: 3000,
        withCloseButton: false
      });
    }
  }, [catePathState]);

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
          <ModelListLoader ui={uiTools} cate={modelCategory} subPath={modelSubPath} keyword={debouncedKeyword} />
        </Stack>
      </Box>
    </Stack>
  );
}
