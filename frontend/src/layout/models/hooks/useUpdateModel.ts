import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshModelInfo } from '@wails/go/remote/RemoteController';
import { useCallback } from 'react';
import { useRevalidator } from 'react-router-dom';

export function useUpdateModel(modelId: number): () => void {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  const updateModelAction = useCallback(async () => {
    try {
      notifications.show({
        id: 'update-model-info',
        title: '更新模型信息',
        message: '正在更新模型信息，请稍候...',
        color: 'blue',
        withCloseButton: false
      });
      await RefreshModelInfo(modelId);
      revalidator.revalidate();
      queryClient.invalidateQueries({ queryKey: ['model-description'] });
      queryClient.invalidateQueries({ queryKey: ['model-tags'] });
      notifications.update({
        id: 'update-model-info',
        title: '模型信息更新成功',
        message: '模型信息已经完成更新。',
        color: 'green',
        autoClose: 3000,
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]更新模型信息：', e);
      notifications.update({
        id: 'update-model-info',
        title: '模型信息更新失败',
        message: `模型信息更新失败，${e}`,
        color: 'red',
        autoClose: 3000,
        withCloseButton: false
      });
    }
  }, [modelId, revalidator]);
  return updateModelAction;
}
