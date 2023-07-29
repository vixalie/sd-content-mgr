import { Box, Flex, Group, Title, TitleProps } from '@mantine/core';
import { FC, PropsWithChildren, ReactNode } from 'react';

type TwoLineInfoCellProps = {
  title: ReactNode;
  tailAction?: ReactNode;
  level: TitleProps['order'];
};

export const TwoLineInfoCell: FC<PropsWithChildren<TwoLineInfoCellProps>> = ({
  title,
  tailAction,
  level,
  children
}) => {
  return (
    <Flex direction="column" justify="flex-start" gap="md">
      <Group spacing="md">
        <Title order={level}>{title}</Title>
        {tailAction}
      </Group>
      <Box sx={{ alignSelf: 'flex-end' }}>{children}</Box>
    </Flex>
  );
};
