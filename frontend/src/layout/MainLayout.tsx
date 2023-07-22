import { Box, Flex, Menu, NavLink, Stack, ThemeIcon, Tooltip } from '@mantine/core';
import {
  IconAdjustmentsHorizontal,
  IconBoxModel,
  IconMenu2,
  IconStack3
} from '@tabler/icons-react';
import { equals } from 'ramda';
import { Outlet, useNavigate } from 'react-router-dom';
import { ConfirmNQuit } from '../../wailsjs/go/main/App';
import { ActivatableNavLink } from '../components/ActivatableNavLink';

export function MainLayout() {
  const navigate = useNavigate();

  return (
    <Flex
      h="100vh"
      w="100vw"
      direction="row"
      justify="flex-start"
      align="flex-start"
      gap={0}
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
          <ActivatableNavLink
            to="/model"
            icon={
              <ThemeIcon size="lg" variant="light">
                <IconBoxModel stroke={1} />
              </ThemeIcon>
            }
          />
        </Tooltip>
        <Tooltip label="内容维护" position="right">
          <ActivatableNavLink
            to="/maintain"
            icon={
              <ThemeIcon size="lg" variant="light">
                <IconStack3 stroke={1} />
              </ThemeIcon>
            }
          />
        </Tooltip>
        <Tooltip label="配置" position="right">
          <ActivatableNavLink
            to="/setup"
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
            <Menu.Item onClick={() => navigate('/about')}>关于...</Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => ConfirmNQuit()}>退出</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>
      <Box h="100%" sx={{ overflowY: 'hidden', flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}
