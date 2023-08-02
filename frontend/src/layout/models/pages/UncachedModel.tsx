import { ActivatePrompts } from '@/components/ActivatePrompts';
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
import { notifications } from '@mantine/notifications';
import { fromBytes } from '@tsmx/human-readable';
import { entities } from '@wails/go/models';
import { ChooseAndSetFileThumbnail } from '@wails/go/models/ModelController';
import { EventsEmit } from '@wails/runtime/runtime';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { BaseModelDescription } from './components/BaseModelDescription';

export const UncachedModel: FC = () => {
  const fileInfo: entities.FileCache = useLoaderData();
  const revalidator = useRevalidator();

  const selectCover = useCallback(async () => {
    try {
      const result = await ChooseAndSetFileThumbnail(fileInfo.id);
      if (result) {
        revalidator.revalidate();
        EventsEmit('updateModelList');
      }
    } catch (e) {
      console.error('[error]选择并设置封面', e);
      notifications.show({
        title: '设置封面失败',
        message: `未能成功复制并记录缩略图文件，${e.message}`,
        color: 'red',
        autoClose: 5000,
        withCloseButton: false
      });
    }
  }, [fileInfo]);

  return (
    <Stack px="md" py="lg" spacing="md">
      <RenameableFile
        fileId={fileInfo.id}
        fileName={fileInfo.fileName}
        onCompleted={() => EventsEmit('updateModelList')}
      />
      <Divider size="sm" />
      <Grid gutter="md">
        <Grid.Col span={7} py="md">
          <AspectRatio ratio={3 / 4} w={450} mx="auto">
            <Image
              src={`/local_file/${fileInfo.thumbnailPath}?${nanoid()}`}
              withPlaceholder
              sx={{ height: '90%' }}
            />
          </AspectRatio>
        </Grid.Col>
        <Grid.Col span={5}>
          <ScrollArea>
            <Stack spacing="md">
              <TwoLineInfoCell title="信息编辑" level={5}>
                <Group>
                  <Button variant="light">尝试获取模型描述</Button>
                  <Button variant="light" onClick={selectCover}>
                    设置模型封面
                  </Button>
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
              <ActivatePrompts editable fileId={fileInfo.id} prompts={fileInfo.additionalPrompts} />
            </Stack>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
