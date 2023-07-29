import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import { ActionIcon, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { RecordFileBaseModel } from '@wails/go/models/ModelController';
import { isEmpty, isNil } from 'ramda';
import { FC, PropsWithChildren, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';

type BaseModelDescriptionProps = {
  fileId: string;
  baseModel?: string;
  onComplete?: (newValue?: string) => void;
};

export const BaseModelDescription: FC<PropsWithChildren<BaseModelDescriptionProps>> = ({
  fileId,
  baseModel,
  onComplete,
  children
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [model, setModel] = useState<string | undefined>(baseModel);
  const ref = useRef<TextInput>(null);
  const revalidator = useRevalidator();
  const recordBaseModel = useCallback(async () => {
    try {
      await RecordFileBaseModel(fileId, model);
      setEditing(false);
      onComplete?.(model);
      revalidator.revalidate();
      notifications.show({
        title: '模型元信息已更新',
        message:
          isNil(model) || isEmpty(model)
            ? `模型的基础模型信息已经清除`
            : `成功更新模型的基础模型为${model}`,
        autoClose: 5000,
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]记录基础模型：', e);
      notifications.show({
        title: '记录基础模型失败',
        message: `未能成功记录模型的基础模型，${e.message}`,
        autoClose: 5000,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [model, fileId, revalidator, onComplete]);

  useLayoutEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <TwoLineInfoCell
      title="基础模型"
      tailAction={
        editing ? (
          <>
            <ActionIcon color="green" onClick={recordBaseModel}>
              <IconCheck stroke={1} />
            </ActionIcon>
            <ActionIcon color="red" onClick={() => setEditing(false)}>
              <IconX stroke={1} />
            </ActionIcon>
          </>
        ) : (
          <ActionIcon onClick={() => setEditing(true)}>
            <IconEdit stroke={1} />
          </ActionIcon>
        )
      }
      level={5}
    >
      {editing ? (
        <TextInput
          value={model}
          onChange={event => setModel(event.target.value)}
          placeholder="输入模型的基础模型……"
          variant="unstyled"
          ref={ref}
        />
      ) : isNil(model) || isEmpty(model) ? (
        '未知'
      ) : (
        model
      )}
    </TwoLineInfoCell>
  );
};
