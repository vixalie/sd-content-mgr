import {
  Box,
  Flex,
  Menu,
  NavLink,
  Stack,
  ThemeIcon,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import {
  IconAdjustmentsHorizontal,
  IconBoxModel,
  IconMenu2,
  IconStack3
} from '@tabler/icons-react';
import { equals } from 'ramda';
import { Outlet, useNavigate } from 'react-router-dom';

export function MainLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  return (
    <Flex
      h="100vh"
      w="100vw"
      direction="row"
      justify="flex-start"
      align="flex-start"
      spacing={0}
      sx={{ overflowY: 'hidden' }}
    >
      <Stack
        w={64}
        h="100%"
        spacing={8}
        p="sm"
        sx={theme => ({
          backgroundColor: equals(theme.colorScheme, 'dark')
            ? theme.colors.cbg[2]
            : theme.colors.cbg[6]
        })}
      >
        <Tooltip label="已安装模型" position="right">
          <NavLink
            onClick={() => navigate('/model')}
            icon={
              <ThemeIcon size="lg" variant="light">
                <IconBoxModel stroke={1} />
              </ThemeIcon>
            }
          />
        </Tooltip>
        <Tooltip label="内容维护" position="right">
          <NavLink
            onClick={() => navigate('/maintain')}
            icon={
              <ThemeIcon size="lg" variant="light">
                <IconStack3 stroke={1} />
              </ThemeIcon>
            }
          />
        </Tooltip>
        <Tooltip label="配置" position="right">
          <NavLink
            onClick={() => navigate('/setup')}
            icon={
              <ThemeIcon size="lg" variant="light">
                <IconAdjustmentsHorizontal stroke={1} />
              </ThemeIcon>
            }
          />
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Menu shadow="md" position="right-end">
          <Menu.Target>
            <NavLink
              icon={
                <ThemeIcon size="lg" variant="light">
                  <IconMenu2 stroke={1} />
                </ThemeIcon>
              }
            />
          </Menu.Target>

          <Menu.Dropdown miw={130}>
            <Menu.Item>关于...</Menu.Item>
            <Menu.Divider />
            <Menu.Item>退出</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>
      <Box h="100%" sx={{ overflowY: 'hidden', flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}
