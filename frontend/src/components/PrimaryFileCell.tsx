import { ActionIcon, Badge, Group, Loader, Text, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconEdit, IconHexagonLetterE, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  BreakModelFileParts,
  CheckModelVersionType,
  CopyModelFileLoader,
  CopyTextureInversionEmbeddingPrompts,
  FetchModelVersionPrimaryFile,
  RenameModelFile
} from '@wails/go/models/ModelController';
import { equals, isEmpty, isNil, not } from 'ramda';
import { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { TwoLineInfoCell } from './TwoLineInfoCell';

type RenameableFileCellProps = {
  modelVersionId: number;
  onCompleted?: (newName: string) => void;
};

export const PrimaryFileCell: FC<RenameableFileCellProps> = ({
  fz,
  modelVersionId,
  onCompleted
}) => {
  const {
    data: modelPrimaryFile,
    isFetching,
    isFetched
  } = useQuery({
    queryKey: ['model-primary-file', modelVersionId],
    queryFn: async () => {
      const primaryFile = await FetchModelVersionPrimaryFile(modelVersionId);
      return primaryFile;
    },
    onError: e => {
      console.error('[error]获取模型版本的首要文件：', e);
    }
  });
  const {
    data: modelType,
    isFetching: isTypeFetching,
    isFetched: isTypeFetched
  } = useQuery({
    queryKey: ['model-type', modelVersionId],
    queryFn: async () => {
      const type = await CheckModelVersionType(modelVersionId);
      return type;
    },
    onError: e => {
      console.error('[error]获取模型版本的类型：', e);
    }
  });
  console.log('[debug]Model Type: ', modelType);
  console.log('[debug]Model Primary File: ', modelVersionId, modelPrimaryFile);
  const funcNotAvaliable = useMemo(() => isEmpty(modelPrimaryFile?.fileName), [modelPrimaryFile]);
  const [editing, setEditing] = useState<boolean>(false);
  const [namePart, setNamePart] = useState<string>('');
  const [extPart, setExtPart] = useState<string>('');
  const ref = useRef<TextInput>(null);
  const revalidator = useRevalidator();
  const renameModelFile = useCallback(async () => {
    if (isNil(modelPrimaryFile)) {
      return;
    }
    try {
      await RenameModelFile(modelPrimaryFile.id, `${namePart}`);
      notifications.show({
        title: '重命名成功',
        message: `文件已重命名为${namePart}${extPart}`,
        color: 'green',
        withCloseButton: false
      });
      revalidator.revalidate();
      setEditing(false);
      onCompleted?.(`${namePart}`);
    } catch (e) {
      console.error('[error]重命名文件：', e);
      notifications.show({
        title: '重命名文件失败',
        message: `未能成功重命名文件，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [modelPrimaryFile?.id, namePart]);
  const switchEditState = useCallback(
    async (state: boolean) => {
      if (!state) {
        setEditing(false);
      }
      if (state && !isNil(modelPrimaryFile)) {
        try {
          const [name, ext] = await BreakModelFileParts(modelPrimaryFile.id);
          setNamePart(name);
          setExtPart(ext);
          setEditing(state);
        } catch (e) {
          console.error('[error]重命名文件：', e);
          notifications.show({
            title: '重命名文件失败',
            message: `未能成功获取文件名的分解，${e.message}`,
            color: 'red',
            withCloseButton: false
          });
        }
      }
    },
    [modelPrimaryFile?.id]
  );
  const copyLoaderPrompt = useCallback(async () => {
    if (isNil(modelPrimaryFile)) {
      return;
    }
    try {
      await CopyModelFileLoader(modelVersionId);
      notifications.show({
        title: '加载提示词已复制',
        message:
          '加载提示词已复制到剪贴板，请到Stable Diffusion WebUI或者Stable Diffusion ComfyUI中粘贴使用。',
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]复制加载提示词：', e);
      notifications.show({
        title: '复制加载提示词失败',
        message: `未能成功复制加载提示词，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [modelVersionId, modelPrimaryFile, isFetching, isFetched]);
  const copyEmbeddingLoaderPrompt = useCallback(async () => {
    if (isNil(modelPrimaryFile)) {
      return;
    }
    try {
      await CopyTextureInversionEmbeddingPrompts(modelVersionId);
      notifications.show({
        title: '加载提示词已复制',
        message: '加载提示词已复制到剪贴板，请到Stable Diffusion ComfyUI中粘贴使用。',
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]复制加载提示词：', e);
      notifications.show({
        title: '复制加载提示词失败',
        message: `未能成功复制加载提示词，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [modelVersionId, modelPrimaryFile, isFetching, isFetched, isTypeFetching, isTypeFetched]);
  useLayoutEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <TwoLineInfoCell
      title="模型主文件名"
      level={5}
      contentW="100%"
      tailAction={
        not(funcNotAvaliable) && (
          <>
            {editing ? (
              <>
                <ActionIcon color="green" onClick={renameModelFile}>
                  <IconCheck stroke={1} />
                </ActionIcon>
                <ActionIcon color="red" onClick={() => switchEditState(false)}>
                  <IconX stroke={1} />
                </ActionIcon>
              </>
            ) : (
              <ActionIcon onClick={() => switchEditState(true)}>
                <IconEdit stroke={1} />
              </ActionIcon>
            )}
            {not(editing) && not(isFetching) && isFetched && (
              <Tooltip label="复制加载提示词">
                <ActionIcon onClick={copyLoaderPrompt}>
                  <IconCopy stroke={1} />
                </ActionIcon>
              </Tooltip>
            )}
            {not(editing) &&
              not(isTypeFetching) &&
              isTypeFetched &&
              equals(modelType, 'textualinversion') && (
                <Tooltip label="复制用于SD ComfyUI的加载提示词">
                  <ActionIcon onClick={copyEmbeddingLoaderPrompt}>
                    <IconHexagonLetterE stroke={1} />
                  </ActionIcon>
                </Tooltip>
              )}
          </>
        )
      }
    >
      {isFetching && (
        <Group>
          <Loader />
          <Text>加载中……</Text>
        </Group>
      )}
      {editing ? (
        <TextInput
          size="md"
          value={namePart}
          onChange={event => setNamePart(event.currentTarget.value)}
          variant="unstyled"
          rightSection={<Badge color="gray">{extPart}</Badge>}
          rightSectionWidth={120}
          ref={ref}
          w="100%"
        />
      ) : (
        <Text fz="md" align="right" color={funcNotAvaliable && 'red'}>
          {funcNotAvaliable ? '本地文件不存在' : modelPrimaryFile?.fileName}
        </Text>
      )}
    </TwoLineInfoCell>
  );
};
