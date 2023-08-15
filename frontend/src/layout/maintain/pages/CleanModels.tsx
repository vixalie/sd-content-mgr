import { useMeasureElement } from '@/hooks/useMeasureElement';
import { Alert, Box, Flex, Tabs, Text } from '@mantine/core';
import { IconAlertHexagon } from '@tabler/icons-react';
import { FC, useRef, useState } from 'react';
import { DuplicatedModels } from './components/DuplicatedModels';
import { useCleanModelsMeasure } from './states/clean-models-measure';

export const CleanModels: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('duplicate');
  const pageRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useMeasureElement(pageRef, useCleanModelsMeasure, 'page');
  useMeasureElement(alertRef, useCleanModelsMeasure, 'alert');
  useMeasureElement(tabsRef, useCleanModelsMeasure, 'tabs');

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="stretch"
      gap="md"
      px="md"
      py="lg"
      h="100vh"
      ref={pageRef}
    >
      <Box sx={{ minHeight: 'max-content' }}>
        <Alert
          icon={<IconAlertHexagon stroke={1} size={24} />}
          color="red"
          title="缓慢操作警告"
          ref={alertRef}
        >
          <Text>
            大部分的清理模型功能需要对所有模型目录中的文件进行扫描，在文件数量较大的时候会消耗大量的时间。
          </Text>
        </Alert>
      </Box>
      <Tabs variant="outline" value={activeTab} onTabChange={setActiveTab} sx={{ flexGrow: 1 }}>
        <Tabs.List ref={tabsRef}>
          <Tabs.Tab value="duplicate">清理重复模型</Tabs.Tab>
          <Tabs.Tab value="unexists">清理已经不存在的模型</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="duplicate" py="xs">
          <DuplicatedModels />
        </Tabs.Panel>

        <Tabs.Panel value="unexists" py="xs">
          <Text>检查不存在的模型文件</Text>
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
};
