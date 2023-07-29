import { Box, Flex, Title, TitleProps } from '@mantine/core';
import { FC, PropsWithChildren, ReactNode } from 'react';

type TwoLineInfoCellProps = {
  title: ReactNode;
  level: TitleProps['order'];
};

export const TwoLineInfoCell: FC<PropsWithChildren<TwoLineInfoCellProps>> = ({
  title,
  level,
  children
}) => {
  return (
    <Flex direction="column" justify="flex-start" gap="md">
      <Title order={level}>{title}</Title>
      <Box sx={{ alignSelf: 'flex-end' }}>{children}</Box>
    </Flex>
  );
};
