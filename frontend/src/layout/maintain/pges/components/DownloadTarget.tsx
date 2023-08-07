import { MoldelSelections } from '@/constants/models';
import {
  Button,
  Divider,
  Group,
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { IconDatabase, IconDownload, IconError404, IconVersions } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { GetModelSubCategoryDirs } from '@wails/go/models/ModelController';
import { isEmpty, isNil } from 'ramda';
import { FC } from 'react';

const hostPathSelection: string = '/';

export const DownloadTarget: FC = () => {
  const theme = useMantineTheme();
  const [url, setUrl] = useUncontrolled({
    defaultValue: ''
  });
  const [modelCategory, setModelCategory] = useUncontrolled({
    defaultValue: ''
  });
  const [targetSubPath, setTargetSubPath] = useUncontrolled({
    defaultValue: hostPathSelection
  });
  const { data: modelCatePath } = useQuery({
    queryKey: ['model-target-cate', 'webui', modelCategory],
    initialData: [],
    enabled: !isNil(modelCategory) && !isEmpty(modelCategory),
    queryFn: async ({ queryKey }) => {
      const [_, ui, category] = queryKey;
      const data = await GetModelSubCategoryDirs(ui, category);
      console.log('[debug]CatePath: ', data);
      return data;
    },
    select: data => [hostPathSelection, ...(data ?? [])]
  });
  return (
    <Stack spacing="md">
      <TextInput
        label="模型链接"
        placeholder="粘贴模型的Civitai URL"
        value={url}
        onChange={event => setUrl(event.currentTarget.value)}
      />
      <Button>检索模型信息</Button>
      <Group spacing="sm" grow>
        <Text sx={{ minWidth: 'max-content' }}>模型名称：</Text>
        <Text sx={{ flexGrow: 1 }}></Text>
      </Group>
      <Group spacing="sm">
        <Select
          label="模型类别"
          data={MoldelSelections}
          value={modelCategory}
          onChange={setModelCategory}
        />
        <Select
          label="目标分类目录"
          data={modelCatePath}
          value={targetSubPath}
          onChange={setTargetSubPath}
        />
        <Select label="模型版本" data={[]} />
        <Group spacing="sm" sx={{ alignSelf: 'flex-end' }}>
          <Tooltip label="模型信息已缓存">
            <IconDatabase stroke={1} color={theme.colors.green[6]} />
          </Tooltip>
          <Tooltip label="模型已下载">
            <IconDownload stroke={1} color={theme.colors.green[6]} />
          </Tooltip>
          <Tooltip label="模型其他版本已下载">
            <IconVersions stroke={1} color={theme.colors.green[6]} />
          </Tooltip>
          <Tooltip label="模型信息未找到">
            <IconError404 stroke={1} color={theme.colors.red[6]} />
          </Tooltip>
        </Group>
      </Group>
      <Group spacing="sm" grow>
        <Button>下载模型</Button>
        <Button color="red">重置当前任务</Button>
      </Group>
      <Progress radius="xs" color="blue" />
      <Group spacing="md">
        <Text sx={{ minWidth: 'max-content' }}>当前状态：</Text>
        <Text sx={{ flexGrow: 1 }}></Text>
      </Group>
      <Divider color="gray" />
    </Stack>
  );
};