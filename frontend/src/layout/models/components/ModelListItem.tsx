import { AspectRatio, Badge, Center, Grid, Image, Stack, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import type { models } from '@wails/go/models.ts';
import { nanoid } from 'nanoid';
import { isEmpty } from 'ramda';
import { NavLink, NavLinkProps } from 'react-router-dom';

type ModelListItemProps = {
  item: models.SimpleModelDescript;
  to: NavLinkProps['to'];
};

export const ModelListItem: FC<ModelListItemProps> = ({
  item,
  to
}: ModelListItemProps): FC<ModelListItemProps> => {
  const { hovered, ref } = useHover();
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Grid
          gutter="xs"
          h="8rem"
          w="100%"
          sx={theme => ({
            ...(hovered && { backgroundColor: theme.colors.blue[7] }),
            ...(isActive && { backgroundColor: theme.colors.blue[9] })
          })}
          ref={ref}
        >
          <Grid.Col span={3} p={4}>
            <Center>
              <AspectRatio ratio={1 / 2} h="100%" w="100%">
                <Image fit="contain" withPlaceholder src={`${item.thumbnailPath}?${nanoid()}`} />
              </AspectRatio>
            </Center>
          </Grid.Col>
          <Grid.Col span={9}>
            <Stack justify="flex-start" align="flex-start" h="8rem" gap={4}>
              <Text size="xs" sx={{ wordBreak: 'break-all', wordWrap: 'break-word' }}>
                {item.name}
              </Text>
              {!isEmpty(item.versionName) && (
                <Badge color={isActive || hovered ? 'lime' : 'blue'}>{item.versionName}</Badge>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </NavLink>
  );
};
