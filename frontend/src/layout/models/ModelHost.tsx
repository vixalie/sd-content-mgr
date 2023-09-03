import { ActionIcon, Affix, Box, Flex, Stack, Tooltip, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { equals, not, path } from 'ramda';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ModelSelection } from './ModelSelection';

export function ModelHost() {
  const navigate = useNavigate();
  const location = useLocation();
  const inSubRoute = useMemo(() => {
    return not(equals(location.pathname, '/model'));
  }, [location]);
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
        w={330}
        h="100%"
        p="md"
        sx={theme => ({
          backgroundColor: equals(theme.colorScheme, 'dark')
            ? path(['cbg', 1], theme.colors)
            : path(['cbg', 7], theme.colors),
          flexShrink: 0
        })}
      >
        <ModelSelection />
      </Stack>
      <Box h="100%" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {inSubRoute && (
          <Affix position={{ top: rem(8), right: rem(8) }}>
            <Tooltip label="关闭当前模型展示" position="bottom">
              <ActionIcon variant="light" color="blue" onClick={() => navigate('/model')}>
                <IconX stroke={1} />
              </ActionIcon>
            </Tooltip>
          </Affix>
        )}
        <Outlet />
      </Box>
    </Flex>
  );
}
