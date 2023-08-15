import { useMeasureElement } from '@/hooks/useMeasureElement';
import { Box, Button, Flex, Group, Paper, ScrollArea } from '@mantine/core';
import { repeat } from 'ramda';
import { FC, useRef } from 'react';
import { useCleanModelsMeasure } from '../states/clean-models-measure';

export const DuplicatedModels: FC = () => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const contentContanerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaheight = useCleanModelsMeasure(
    state =>
      state.page.height - state.alert.height - state.tabs.height - state.control.height - 24 * 2
  );
  console.log('[debug]Scroll Height: ', scrollAreaheight);
  console.log('[debug]Measure State: ', useCleanModelsMeasure.getState());

  useMeasureElement(panelRef, useCleanModelsMeasure, 'panel');
  useMeasureElement(controlRef, useCleanModelsMeasure, 'control');
  useMeasureElement(contentContanerRef, useCleanModelsMeasure, 'content');

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="flex-start"
      gap="sm"
      h="100%"
      ref={panelRef}
    >
      <Group spacing="sm" ref={controlRef} sx={{ minHeight: 'max-content' }}>
        <Button variant="filled" color="blue">
          扫描重复模型
        </Button>
      </Group>
      <Box w="100%" sx={{ flexGrow: 1, overflow: 'hidden' }} ref={contentContanerRef}>
        <ScrollArea h={scrollAreaheight}>
          {repeat('abcd', 30).map((value, index) => (
            <Paper key={index}>{value}</Paper>
          ))}
        </ScrollArea>
      </Box>
    </Flex>
  );
};
