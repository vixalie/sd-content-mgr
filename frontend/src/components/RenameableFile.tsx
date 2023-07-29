import { ActionIcon, Badge, Group, Text, TextInput, TextProps } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { BreakModelFileParts, RenameModelFile } from '@wails/go/models/ModelController';
import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';

type RenameableFileProps = {
  fz?: TextProps['fz'];
  bold?: boolean;
  fileId: string;
  fileName: string;
  onCompleted?: (newName: string) => void;
};

export const RenameableFile: FC<RenameableFileProps> = ({
  fz,
  bold,
  fileId,
  fileName,
  onCompleted
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [namePart, setNamePart] = useState<string>('');
  const [extPart, setExtPart] = useState<string>('');
  const ref = useRef<TextInput>(null);
  const revalidator = useRevalidator();
  const switchEditState = useCallback(async (state: boolean) => {
    setEditing(state);
    if (state) {
      try {
        const [name, ext] = await BreakModelFileParts(fileId);
        setNamePart(name);
        setExtPart(ext);
      } catch (e) {
        console.error('[error]重命名文件：', e);
        notifications.show({
          title: '重命名文件失败',
          message: `未能成功获取文件名的分解，${e.message}`,
          autoClose: 5000,
          color: 'red',
          withCloseButton: false
        });
      }
    }
  }, []);
  const renameFile = useCallback(async () => {
    try {
      await RenameModelFile(fileId, namePart);
      setEditing(false);
      onCompleted?.(fileId);
      revalidator.revalidate();
      notifications.show({
        title: '重命名文件成功',
        message: `成功重命名文件为${namePart}${extPart}`,
        autoClose: 5000,
        color: 'green',
        withCloseButton: false
      });
    } catch (e) {
      console.error('[error]重命名文件：', e);
      notifications.show({
        title: '重命名文件失败',
        message: `未能成功重命名文件，${e.message}`,
        autoClose: 5000,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [namePart, extPart, fileId, onCompleted, revalidator]);

  useLayoutEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <Group>
      {editing ? (
        <>
          <TextInput
            size={fz ?? 'lg'}
            value={namePart}
            onChange={event => setNamePart(event.currentTarget.value)}
            variant="unstyled"
            rightSection={<Badge color="gray">{extPart}</Badge>}
            rightSectionWidth={120}
            ref={ref}
            sx={{ ...((bold ?? false) && { fontWeight: 500 }) }}
          />
          <ActionIcon color="green" onClick={renameFile}>
            <IconCheck stroke={1} />
          </ActionIcon>
          <ActionIcon color="red" onClick={() => switchEditState(false)}>
            <IconX stroke={1} />
          </ActionIcon>
        </>
      ) : (
        <>
          <Text fz={fz ?? 'lg'} fw={(bold ?? false) && 500} py="0.75rem">
            {fileName}
          </Text>
          <ActionIcon onClick={() => switchEditState(true)}>
            <IconEdit stroke={1} />
          </ActionIcon>
        </>
      )}
    </Group>
  );
};