import { notifications } from '@mantine/notifications';
import { SaveNewAppBehaviours } from '@wails/go/config/ApplicationSettings';
import { config } from '@wails/go/models';
import { useCallback } from 'react';
import { useRevalidator } from 'react-router-dom';

export function usePersistBehaviours(): (formValue: config.AppBehaviours) => Promise<boolean> {
  const revalidator = useRevalidator();
  const persistHandler = useCallback(async (formValue: config.AppBehaviours) => {
    const result = await SaveNewAppBehaviours(formValue);
    if (result) {
      notifications.show({
        title: '保存成功',
        message: '应用行为设置已保存',
        color: 'green',
        withCloseButton: false
      });
      revalidator.revalidate();
    } else {
      notifications.show({
        title: '保存失败',
        message: '应用行为设置保存失败',
        color: 'red',
        withCloseButton: false
      });
    }
  }, []);

  return persistHandler;
}
