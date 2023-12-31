import { TwoLineInfoCell } from '@/components/TwoLineInfoCell';
import { useMeasureElement } from '@/hooks/useMeasureElement';
import styled from '@emotion/styled';
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Center,
  Drawer,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangleFilled,
  IconAward,
  IconAwardFilled,
  IconChevronLeft,
  IconChevronRight,
  IconEyeExclamation,
  IconInfoCircle
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@wails/go/models';
import { IsImageAsThumbnail, SetModelVersionThumbnail } from '@wails/go/models/ModelController';
import { EventsOff, EventsOn } from '@wails/runtime';
import { nanoid } from 'nanoid';
import { has, not, prop } from 'ramda';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { infoZoneHeightSelector, useCachedModelMeasure } from '../states/cached-model-measure';

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
  const queryClient = useQueryClient();
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
          queryClient.invalidateQueries({
            queryKey: ['model-image-thumbnail-check', image.versionId, image.id]
          });
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
  currentCover?: string;
};

export const ImageSlide: FC<ImageSlideProps> = ({ images, currentCover }) => {
  const theme = useMantineTheme();

  const imageHandleRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  useMeasureElement(imageHandleRef, useCachedModelMeasure, 'imageHandle');
  useMeasureElement(imageContainerRef, useCachedModelMeasure, 'imageContainer');

  const imageZoneHeight = useCachedModelMeasure(infoZoneHeightSelector());
  const [imageHeight, imageWidth] = useCachedModelMeasure(state => [
    state.imageContainer.height - 4 * 2,
    state.imageContainer.width
  ]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(() => 0);
  const [opened, { open, close }] = useDisclosure(false);
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
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
  const imageMeta = useMemo(() => images[activeImageIndex].meta, [activeImageIndex, images]);
  const { data: isThumbnail } = useQuery({
    queryKey: [
      'model-image-thumbnail-check',
      images[activeImageIndex].versionId,
      images[activeImageIndex].id
    ],
    queryFn: async ({ queryKey }) => {
      const [_, versionId, imageId] = queryKey;
      return await IsImageAsThumbnail(versionId, imageId);
    }
  });
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
  const setAsCover = useCallback(async () => {
    const activeImage = images[activeImageIndex];
    try {
      await SetModelVersionThumbnail(activeImage.versionId, activeImage.id);
      revalidator.revalidate();
      queryClient.invalidateQueries(['model-list']);
    } catch (e) {
      console.error('[error]设置模型封面图片：', e);
      notifications.show({
        title: '模型封面设置失败',
        message: `未能成功设置模型封面图片，${e}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }, [images, activeImageIndex]);
  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);
  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="stretch"
      h={imageZoneHeight}
      w="100%"
      gap="md"
    >
      <ImageContainer ref={imageContainerRef}>
        <ModelImage
          image={images[activeImageIndex]}
          maxWidth={imageWidth}
          maxHeight={imageHeight}
        />
      </ImageContainer>
      <Group position="left" spacing="md" w="100%" ref={imageHandleRef}>
        <Tooltip label="上一张" position="top">
          <ActionIcon onClick={handlePreviousImage}>
            <IconChevronLeft stroke={1} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="设为缩略图" position="top">
          <ActionIcon
            color={isThumbnail && 'yellow'}
            onClick={not(isThumbnail) ? setAsCover : () => {}}
          >
            {isThumbnail ? <IconAwardFilled stroke={1} /> : <IconAward stroke={1} />}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="例图生成信息" position="top">
          <ActionIcon onClick={open}>
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
      <>
        <Drawer opened={opened} onClose={close} position="right">
          <Stack spacing="md">
            {has('Model', imageMeta) && (
              <TwoLineInfoCell title="生成模型" level={4}>
                {prop('Model', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('sampler', imageMeta) && (
              <TwoLineInfoCell title="采样器" level={4}>
                {prop('sampler', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('cfgScale', imageMeta) && (
              <TwoLineInfoCell title="CFG Scale" level={4}>
                {prop('cfgScale', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('steps', imageMeta) && (
              <TwoLineInfoCell title="步数" level={4}>
                {prop('steps', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('seed', imageMeta) && (
              <TwoLineInfoCell title="种子" level={4}>
                {prop('seed', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('Clip skip', imageMeta) && (
              <TwoLineInfoCell title="Clip skip" level={4}>
                {prop('Clip skip', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('Hires upscaler', imageMeta) && (
              <TwoLineInfoCell title="Hires 放大器" level={4}>
                {prop('Hires upscaler', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('Hires upscale', imageMeta) && (
              <TwoLineInfoCell title="Hires 放大倍数" level={4}>
                {prop('Hires upscale', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('Hires steps', imageMeta) && (
              <TwoLineInfoCell title="Hires 步数" level={4}>
                {prop('Hires steps', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('Denoising strength', imageMeta) && (
              <TwoLineInfoCell title="去噪强度" level={5}>
                {prop('Denoising strength', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('prompt', imageMeta) && (
              <TwoLineInfoCell title="提示词" level={4}>
                {prop('prompt', imageMeta)}
              </TwoLineInfoCell>
            )}
            {has('negativePrompt', imageMeta) && (
              <TwoLineInfoCell title="负向提示词" level={4}>
                {prop('negativePrompt', imageMeta)}
              </TwoLineInfoCell>
            )}
          </Stack>
        </Drawer>
      </>
    </Flex>
  );
};
