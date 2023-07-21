import { Box, Flex, Text } from '@mantine/core';

export function Welcome() {
  return (
    <Flex direction="row" justify="center" align="center" h="100%">
      <Box
        py="xs"
        px="xl"
        sx={theme => ({
          border: 'none',
          borderBottomStyle: 'solid',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.indigo[7]
        })}
      >
        <Text size={72} weight="bold" italic color="indigo">
          Welcome
        </Text>
      </Box>
    </Flex>
  );
}
