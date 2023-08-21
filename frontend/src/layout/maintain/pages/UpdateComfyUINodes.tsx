import { ScrollArea, Stack } from '@mantine/core';
import { keys } from 'ramda';
import { FC } from 'react';
import { useLoaderData } from 'react-router-dom';
import { ExtensionCard } from './components/ExtensionCard';

export const UpdateComfyUINodes: FC = () => {
  const nodes: Record<string, string> = useLoaderData();

  return (
    <ScrollArea h="100vh" w="100%">
      <Stack spacing="md" px="md" py="lg">
        {keys(nodes).map(key => (
          <ExtensionCard key={key} name={key} path={nodes[key]} />
        ))}
      </Stack>
    </ScrollArea>
  );
};
