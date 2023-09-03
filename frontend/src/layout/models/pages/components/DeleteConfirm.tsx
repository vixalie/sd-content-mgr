import { Openable } from '@/types';
import { Button, Group, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  ForwardRefExoticComponent,
  Ref,
  RefAttributes,
  forwardRef,
  useImperativeHandle
} from 'react';

type DeleteConfirmProps = {
  onConfirm?: () => Promise<void>;
};

export const DeleteConfirm: ForwardRefExoticComponent<
  DeleteConfirmProps & RefAttributes<Openable>
> = forwardRef(({ onConfirm }, ref: Ref<Openable>) => {
  const [opened, { open, close }] = useDisclosure(false);
  useImperativeHandle(
    ref,
    () => ({
      open() {
        open();
      }
    }),
    []
  );
  return (
    <>
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Stack spacing="md">
          <p>即将删除当前正在展示的模型，请确认操作！</p>
          <Group position="right" spacing="sm">
            <Button variant="light" color="blue" onClick={close}>
              取消
            </Button>
            <Button
              variant="light"
              color="red"
              onClick={async () => {
                await onConfirm?.();
                close();
              }}
            >
              删除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
});
