import { ActionIcon, Chip, Flex, Stack, TextInput, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconClearAll, IconCopy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { DeleteFilePrompts, RecordFilePrompts } from '@wails/go/models/ModelController';
import { ClipboardSetText } from '@wails/runtime/runtime';
import { isEmpty } from 'ramda';
import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { TwoLineInfoCell } from './TwoLineInfoCell';

type ActivatePromptsProps = {
  fileId?: string;
  prompts: string[];
  editable?: boolean;
  onComplete?: (newValue?: string[]) => void;
};

export const ActivatePrompts: FC<ActivatePromptsProps> = ({
  fileId,
  prompts,
  editable,
  onComplete
}) => {
  const compoEditable = editable ?? false;
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [newPrompts, setNewPrompts] = useState<string>('');
  const ref = useRef<TextInput>(null);
  const revalidator = useRevalidator();

  const copyToClipboard = useCallback(async () => {
    const result = await ClipboardSetText(selectedPrompts.join(', '));
    if (result) {
      notifications.show({
        message: '选择的激活提示词已经复制到剪贴板了。',
        color: 'green',
        withCloseButton: false
      });
    } else {
      notifications.show({
        message: '未能成功将选择的激活提示词复制到剪贴板。',
        color: 'red',
        withCloseButton: false
      });
    }
  }, [selectedPrompts]);
  const saveNewPrompts = useCallback(async () => {
    try {
      await RecordFilePrompts(fileId, newPrompts);
      setEditing(false);
      setNewPrompts('');
      onComplete?.(newPrompts.split(',').map(s => s.trim()));
      revalidator.revalidate();
      notifications.show({
        title: '保存提示词成功',
        message: '新的提示词已经保存成功。',
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]保存新输入提示词', e);
      notifications.show({
        title: '保存提示词失败',
        message: `未能保存新的提示词，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [editable, editing, fileId, newPrompts, revalidator, onComplete]);
  const deleteSelectedPrompts = useCallback(async () => {
    try {
      await DeleteFilePrompts(fileId, selectedPrompts);
      setEditing(false);
      setSelectedPrompts([]);
      onComplete?.(selectedPrompts);
      revalidator.revalidate();
      notifications.show({
        title: '删除提示词成功',
        message: '选择的提示词已经成功删除。',
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]删除提示词', e);
      notifications.show({
        title: '删除提示词失败',
        message: `未能删除选择的提示词，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [editable, editing, fileId, selectedPrompts, revalidator, onComplete]);

  useLayoutEffect(() => {
    if (editable && editing) {
      ref.current?.focus();
    }
  }, [editable, editing]);

  return (
    <TwoLineInfoCell
      title="激活提示词"
      contentW="100%"
      tailAction={
        <>
          {!isEmpty(selectedPrompts) && (
            <>
              <Tooltip label="复制激活提示词" position="top">
                <ActionIcon onClick={copyToClipboard}>
                  <IconCopy stroke={1} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="清除当前的选择" position="top">
                <ActionIcon onClick={() => setSelectedPrompts([])}>
                  <IconClearAll stroke={1} />
                </ActionIcon>
              </Tooltip>
              {compoEditable && (
                <Tooltip label="删除当前选择的提示词" position="top">
                  <ActionIcon onClick={deleteSelectedPrompts}>
                    <IconTrash stroke={1} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}
          {compoEditable &&
            (editing ? (
              <>
                <ActionIcon color="green" onClick={saveNewPrompts}>
                  <IconCheck stroke={1} />
                </ActionIcon>
                <ActionIcon color="red" onClick={() => setEditing(false)}>
                  <IconX stroke={1} />
                </ActionIcon>
              </>
            ) : (
              <ActionIcon onClick={() => setEditing(true)}>
                <IconPlus stroke={1} />
              </ActionIcon>
            ))}
        </>
      }
      level={5}
    >
      <Stack spacing="md">
        {compoEditable && editing && (
          <TextInput
            w="100%"
            placeholder="输入要添加的提示词，以“,”分隔"
            value={newPrompts}
            onChange={event => setNewPrompts(event.currentTarget.value)}
          />
        )}
        <Flex direction="row" justify="flex-start" align="flex-start" wrap="wrap" gap="md">
          <Chip.Group multiple value={selectedPrompts} onChange={setSelectedPrompts}>
            {(prompts ?? []).map(prompt => (
              <Chip variant="filled" value={prompt} key={prompt}>
                {prompt}
              </Chip>
            ))}
          </Chip.Group>
        </Flex>
      </Stack>
    </TwoLineInfoCell>
  );
};
