import { Box, Center, Group, Loader, ScrollArea, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FetchModelVersionDescription } from '@wails/go/models/ModelController';
import { isEmpty } from 'ramda';
import { FC } from 'react';

type ModelDescriptionProps = {
  modelVersionId: number;
};

export const ModelDescription: FC<ModelDescriptionProps> = ({ modelVersionId }) => {
  const { data: description, isFetching } = useQuery({
    queryKey: ['model-description', modelVersionId],
    queryFn: async ({ queryKey }) => {
      const [_, modelVersionId] = queryKey;
      return await FetchModelVersionDescription(modelVersionId);
    }
  });
  return (
    <Box py="1rem" px="5rem">
      {isFetching && (
        <Center>
          <Group>
            <Loader />
            <Text>加载中……</Text>
          </Group>
        </Center>
      )}
      <ScrollArea>{!isEmpty(description) ? description : <Text>暂无描述</Text>}</ScrollArea>
    </Box>
  );
};
