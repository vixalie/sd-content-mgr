import { Box, Center, Group, Loader, ScrollArea, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FetchModelVersionDescription } from '@wails/go/models/ModelController';
import { isEmpty } from 'ramda';
import { FC } from 'react';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

type ModelDescriptionProps = {
  modelVersionId: number;
};

export const ModelDescription: FC<ModelDescriptionProps> = ({ modelVersionId }) => {
  const descriptionHeight = useCachedModelMeasure(infoZoneHeightSelector());
  const { data: description, isFetching } = useQuery({
    queryKey: ['model-description', modelVersionId],
    queryFn: async ({ queryKey }) => {
      const [_, modelVersionId] = queryKey;
      return await FetchModelVersionDescription(modelVersionId);
    }
  });
  return (
    <Box py="1rem" px="5rem" h={descriptionHeight} component={ScrollArea}>
      {isFetching && (
        <Center>
          <Group>
            <Loader />
            <Text>加载中……</Text>
          </Group>
        </Center>
      )}
      {!isEmpty(description) ? (
        <Box h="100%" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <Text>暂无描述</Text>
      )}
    </Box>
  );
};
