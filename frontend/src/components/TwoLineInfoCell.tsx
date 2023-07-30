import { Box, Flex, Group, MantineStyleSystemProps, Title, TitleProps } from '@mantine/core';
import { FC, PropsWithChildren, ReactNode } from 'react';

type TwoLineInfoCellProps = {
  title: ReactNode;
  tailAction?: ReactNode;
  level: TitleProps['order'];
  contentW?: MantineStyleSystemProps['w'];
};

export const TwoLineInfoCell: FC<PropsWithChildren<TwoLineInfoCellProps>> = ({
  title,
  tailAction,
  level,
  contentW,
  children
}) => {
  const contentWidth = contentW ?? 'inherit';
  return (
    <Flex direction="column" justify="flex-start" gap="md">
      <Group spacing="md">
        <Title order={level}>{title}</Title>
        {tailAction}
      </Group>
      <Box w={contentWidth} sx={{ alignSelf: 'flex-end' }}>
        {children}
      </Box>
    </Flex>
  );
};
