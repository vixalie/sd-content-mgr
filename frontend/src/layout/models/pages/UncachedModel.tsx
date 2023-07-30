import { ModelMemo } from '@/components/ModelMemo';
import { RenameableFile } from '@/components/RenameableFile';
import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { fromBytes } from '@tsmx/human-readable';
import { entities } from '@wails/go/models';
import { useLoaderData } from 'react-router-dom';
import { BaseModelDescription } from './components/BaseModelDescription';

export const UncachedModel: FC = () => {
  const fileInfo: entities.FileCache = useLoaderData();
  const queryClient = useQueryClient();

  return (
    <Stack px="md" py="lg" spacing="md">
      <RenameableFile
        fileId={fileInfo.id}
        fileName={fileInfo.fileName}
        onCompleted={() => queryClient.invalidateQueries(['model-cate-list'])}
      />
      <Divider size="sm" />
      <Grid gutter="md">
        <Grid.Col span={7}>
          <AspectRatio ratio={2 / 3} maw={450} mx="auto">
            <Image src={fileInfo.thumbnailPath} withPlaceholder />
          </AspectRatio>
        </Grid.Col>
        <Grid.Col span={5}>
          <ScrollArea>
            <Stack spacing="md">
              <TwoLineInfoCell title="信息编辑" level={5}>
                <Group>
                  <Button variant="light">尝试获取模型描述</Button>
                  <Button variant="light">设置模型封面</Button>
                </Group>
              </TwoLineInfoCell>
              <TwoLineInfoCell title="文件大小" level={5}>
                <Text>{fromBytes(fileInfo.fileSize, { fixedPrecision: 2 })}</Text>
              </TwoLineInfoCell>
              <TwoLineInfoCell title="文件Hash" level={5}>
                <Tooltip label={fileInfo.fileHash} placement="bottom">
                  <Box maw={250}>
                    <Text truncate>{fileInfo.fileHash}</Text>
                  </Box>
                </Tooltip>
              </TwoLineInfoCell>
              <BaseModelDescription fileId={fileInfo.id} baseModel={fileInfo.baseModel} />
              <ModelMemo fileId={fileInfo.id} memo={fileInfo.memo} />
              <TwoLineInfoCell title={'激活提示词'} level={5}>
                <Text></Text>
              </TwoLineInfoCell>
            </Stack>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
