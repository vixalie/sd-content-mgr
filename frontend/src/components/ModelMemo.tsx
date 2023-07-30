import { ActionIcon, Textarea } from '@mantine/core';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { RecordFileMemo } from '@wails/go/models/ModelController';
import { isEmpty, isNil } from 'ramda';
import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { TwoLineInfoCell } from './TwoLineInfoCell';

type ModelMemoProps = {
  fileId: string;
  fileMemo?: string;
  onComplete?: (newValue?: string) => void;
};

export const ModelMemo: FC<ModelMemoProps> = ({ fileId, fileMemo, onComplete }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [memo, setMemo] = useState<string | undefined>(fileMemo);
  const ref = useRef(null);
  const revalidator = useRevalidator();
  const recordMemo = useCallback(async () => {
    try {
      await RecordFileMemo(fileId, memo);
      setEditing(false);
      onComplete?.(memo);
      revalidator.revalidate();
      notifications.show({
        title: '模型备注已更新',
        message: `成功更新模型的备注。`,
        autoClose: 5000,
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]记录模型备注：', e);
      notifications.show({
        title: '记录模型备注失败',
        message: `未能成功记录模型的备注，${e.message}`,
        autoClose: 5000,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [memo, fileId, revalidator, onComplete]);

  useLayoutEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <TwoLineInfoCell
      title="模型备注"
      tailAction={
        editing ? (
          <>
            <ActionIcon color="green" onClick={recordMemo}>
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
      contentW={editing ? '100%' : undefined}
      level={5}
    >
      {editing ? (
        <Textarea
          variant="unstyled"
          value={memo}
          placeholder="输入模型备注……"
          ref={ref}
          onChange={event => setMemo(event.currentTarget.value)}
        />
      ) : isNil(memo) || isEmpty(memo) ? (
        '无'
      ) : (
        memo
      )}
    </TwoLineInfoCell>
  );
};
