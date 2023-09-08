import { Box, Flex, Text } from '@mantine/core';

export function About() {
  return (
    <Flex direction="column" justify="center" align="center" px={32} py={64}>
      <Box
        py={8}
        px={32}
        sx={theme => ({
          border: 'none',
          borderBottomColor: theme.colors.indigo[6],
          borderBlockWidth: 1,
          borderBottomStyle: 'solid'
        })}
      >
        <h1>SD Content Manager</h1>
      </Box>
      <Box py={8}>
        <Text>Version 0.4.16</Text>
      </Box>
    </Flex>
  );
}
