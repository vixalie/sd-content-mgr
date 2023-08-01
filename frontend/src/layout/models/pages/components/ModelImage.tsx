import styled from '@emotion/styled';
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Center,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconAlertTriangleFilled,
  IconAward,
  IconChevronLeft,
  IconChevronRight,
  IconEyeExclamation,
  IconInfoCircle
} from '@tabler/icons-react';
import { entities } from '@wails/go/models';
import { EventsOff, EventsOn } from '@wails/runtime';
import { nanoid } from 'nanoid';
import { prop } from 'ramda';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

const ImageContainer = styled.div`
  flex-grow: 1;
  width: 100%;
  height: 100%;
`;

type ModelImageProps = {
  image: entities.Image;
  maxWidth: number;
  maxHeight: number;
};

export const ModelImage: FC<ModelImageProps> = ({ image, maxWidth, maxHeight }) => {
  const theme = useMantineTheme();
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadFailure, setDownloadFailure] = useState<boolean>(false);
  useEffect(() => {
    setDownloadFailure(false);
    EventsOn(image.id, payload => {
      switch (prop('state', payload)) {
        case 'start':
          setDownloading(true);
          break;
        case 'progress':
          break;
        case 'finish':
          setDownloading(false);
          break;
        case 'failed':
          setDownloading(false);
          setDownloadFailure(true);
          break;
      }
    });
    return () => {
      EventsOff(image.id);
    };
  }, [image]);

  return (
    <Center>
      <AspectRatio ratio={image?.width / image?.height ?? 1} w={maxWidth} h={maxHeight}>
        <Image
          fit="contain"
          src={downloadFailure ? null : `/model_version_image/${image.id}.image?${nanoid()}`}
          withPlaceholder
        />
        <LoadingOverlay
          visible={downloading}
          overlayBlur={7}
          overlayColor="gray"
          loader={
            <Group spacing="md">
              <Loader />
              <Text>下载中……</Text>
            </Group>
          }
        />
        <LoadingOverlay
          visible={downloadFailure}
          overlayBlur={7}
          overlayColor={theme.colors.red[theme.colorScheme === 'dark' ? 6 : 3]}
          loader={
            <Group spacing="md">
              <IconAlertTriangleFilled
                stroke={1}
                size={32}
                color={theme.colors.red[theme.colorScheme === 'dark' ? 6 : 3]}
              />
              <Text>下载失败</Text>
            </Group>
          }
        />
      </AspectRatio>
    </Center>
  );
};

type ImageSlideProps = {
  images: entities.Image[];
};

export const ImageSlide: FC<ImageSlideProps> = ({ images }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const { ref, width, height } = useElementSize();
  const [nsfwColor, nsfwDescription] = useMemo(() => {
    switch (images[activeImageIndex].nsfw ?? 0) {
      case 0:
        return ['green', 'SFW'];
      case 1:
        return ['yellow', 'NSFW-'];
      case 2:
        return ['orange', 'NSFW'];
      case 3:
        return ['red', 'NSFW+'];
    }
  }, [activeImageIndex, images]);
  const handlePreviousImage = useCallback(() => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    } else {
      setActiveImageIndex(images.length - 1);
    }
  }, [images, activeImageIndex]);
  const handleNextImage = useCallback(() => {
    if (activeImageIndex < images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    } else {
      setActiveImageIndex(0);
    }
  }, [images, activeImageIndex]);
  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);
  return (
    <Flex direction="column" justify="flex-start" align="stretch" h="95%" w="100%" gap="md">
      <ImageContainer ref={ref}>
        <ModelImage image={images[activeImageIndex]} maxWidth={width} maxHeight={height} />
      </ImageContainer>
      <Group position="left" spacing="md" w="100%">
        <Tooltip label="上一张" position="top">
          <ActionIcon onClick={handlePreviousImage}>
            <IconChevronLeft stroke={1} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="设为缩略图" position="top">
          <ActionIcon>
            <IconAward stroke={1} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="例图备注" position="top">
          <ActionIcon>
            <IconInfoCircle stroke={1} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="下一张" position="top">
          <ActionIcon onClick={handleNextImage}>
            <IconChevronRight stroke={1} />
          </ActionIcon>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Badge color="blue" size="lg">
          {activeImageIndex + 1} / {images.length}
        </Badge>
        <Group spacing="sm">
          <ThemeIcon color={nsfwColor} variant="filled" size="md">
            <IconEyeExclamation stroke={1} />
          </ThemeIcon>
          <Text color={nsfwColor}>{nsfwDescription}</Text>
        </Group>
      </Group>
    </Flex>
  );
};
