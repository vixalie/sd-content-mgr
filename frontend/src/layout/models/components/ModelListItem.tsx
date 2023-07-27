import { Grid, Image, Stack, Text } from '@mantine/core';
import type { models } from '@wails/go/models.ts';

type ModelListItemProps = {
  item: models.SimpleModelDescript;
};

export const ModelListItem: FC<ModelListItemProps> = ({
  item
}: ModelListItemProps): FC<ModelListItemProps> => {
  return (
    <Grid gutter="xs" h="4.5rem" w="100%">
      <Grid.Col span={2}>
        <Image height="4.5rem" fit="cover" withPlaceholder src={item.thumbnailPath} />
      </Grid.Col>
      <Grid.Col span={10}>
        <Stack justify="flex-start" align="flex-start" h="4.5rem" gap="xs">
          <Text size="xs" truncate>
            {item.name}
          </Text>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
