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
import { useQueryClient } from '@tanstack/react-query';
import { fromBytes } from '@tsmx/human-readable';
import { entities } from '@wails/go/models';
import { ChooseAndSetFileThumbnail } from '@wails/go/models/ModelController';
import { RefreshModelVersionInfoByHash } from '@wails/go/remote/RemoteController';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { BaseModelDescription } from './components/BaseModelDescription';

export const UncachedModel: FC = () => {
  const fileInfo: entities.FileCache = useLoaderData();
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const selectCover = useCallback(async () => {
    try {
      const result = await ChooseAndSetFileThumbnail(fileInfo.id);
      if (result) {
        revalidator.revalidate();
        queryClient.invalidateQueries(['model-list']);
      }
    } catch (e) {
      console.error('[error]选择并设置封面', e);
      notifications.show({
        title: '设置封面失败',
        message: `未能成功复制并记录缩略图文件，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [fileInfo]);
  const cacheModel = useCallback(async () => {
    try {
      const modelVersionId = await RefreshModelVersionInfoByHash(fileInfo.fileHash);
      queryClient.invalidateQueries(['model-list']);
      navigate(`/model/version/${modelVersionId}`);
      notifications.show({
        title: '缓存模型成功',
        message: `已成功缓存模型，现在模型将转入已缓存模型展示页面。`,
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]使用文件Hash缓存模型信息：', e);
      notifications.show({
        title: '缓存模型失败',
        message: `未能成功缓存模型，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [fileInfo]);

  return (
    <Stack px="md" py="lg" spacing="md">
      <RenameableFile
        fileId={fileInfo.id}
        fileName={fileInfo.fileName}
        onCompleted={() => queryClient.invalidateQueries(['model-list'])}
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
                  <Button variant="light" onClick={cacheModel}>
                    尝试获取模型描述
                  </Button>
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
