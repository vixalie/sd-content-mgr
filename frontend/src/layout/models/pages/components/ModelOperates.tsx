import { Openable } from '@/types';
import { Box, Button, ScrollArea, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DeleteLocalFiles } from '@wails/go/models/ModelController';
import { EventsEmit } from '@wails/runtime/runtime';
import { FC, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateModel } from '../../hooks/useUpdateModel';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';
import { DeleteConfirm } from './DeleteConfirm';

type ModelOperatesProps = {
  modelVersionId: number;
  modelId: number;
};

function useHandleDeleteModelLocalFile(modelVersionId: number): () => Promise<void> {
  const navigate = useNavigate();
  const deleteLocalFileAction = useCallback(async () => {
    try {
      await DeleteLocalFiles(modelVersionId);
      notifications.show({
        title: '删除模型版本文件成功',
        message: '已成功删除指定模型版本的本地文件',
        color: 'green',
        withCloseButton: false
      });
      EventsEmit('reloadModelList');
      navigate('/model');
    } catch (e) {
      notifications.show({
        title: '删除模型版本文件失败',
        message: '未能成功删除指定模型版本的本地文件，${e.message}',
        color: 'red',
        withCloseButton: false
      });
    }
  }, [modelVersionId]);
  return deleteLocalFileAction;
}

export const ModelOperates: FC<ModelOperatesProps> = ({ modelVersionId, modelId }) => {
  const operatesHeight = useCachedModelMeasure(infoZoneHeightSelector());
  const refreshModelInfo = useUpdateModel(modelId);
  const deleteConf = useRef<Openable>(null);
  const deleteAction = useHandleDeleteModelLocalFile(modelVersionId);
  return (
    <Box py="1rem" px="5rem" h={operatesHeight} component={ScrollArea}>
      <Stack spacing="md" align="stretch">
        <Button variant="light" color="blue" onClick={refreshModelInfo}>
          刷新模型信息
        </Button>
        <Button variant="light" color="red" onClick={() => deleteConf.current?.open()}>
          删除当前模型版本文件
        </Button>
      </Stack>
      <DeleteConfirm ref={deleteConf} onConfirm={deleteAction} />
    </Box>
  );
};
