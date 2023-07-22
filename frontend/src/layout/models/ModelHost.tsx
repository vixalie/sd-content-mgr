import { Box, Flex, Stack } from '@mantine/core';
import { equals, path } from 'ramda';
import { Outlet } from 'react-router-dom';
import { ModelSelection } from './ModelSelection';

export function ModelHost() {
  return (
    <Flex
      direction="row"
      justify="flex-start"
      align="flex-start"
      gap={0}
      h="100vh"
      sx={{ overflowY: 'hidden' }}
    >
      <Stack
        w={230}
        h="100%"
        p="md"
        sx={theme => ({
          backgroundColor: equals(theme.colorScheme, 'dark')
            ? path(['cbg', 1], theme.colors)
            : path(['cbg', 7], theme.colors)
        })}
      >
        <ModelSelection />
      </Stack>
      <Box h="100%" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Flex>
  );
}
