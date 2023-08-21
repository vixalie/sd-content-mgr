import { createStore } from '@/store_creator';
import { ElementPosition, InitialElementPosition } from '@/types';
import { clone } from 'ramda';

type CachedModelMeasureState = {
  page: ElementPosition;
  modelName: ElementPosition;
  versionName: ElementPosition;
  tags: ElementPosition;
  tabs: ElementPosition;
  panel: ElementPosition;
  imageContainer: ElementPosition;
  image: ElementPosition;
  imageHandle: ElementPosition;
  infoZone: ElementPosition;
};

export const useCachedModelMeasure = createStore<CachedModelMeasureState>(set => ({
  page: clone(InitialElementPosition),
  modelName: clone(InitialElementPosition),
  versionName: clone(InitialElementPosition),
  tags: clone(InitialElementPosition),
  tabs: clone(InitialElementPosition),
  panel: clone(InitialElementPosition),
  imageContainer: clone(InitialElementPosition),
  image: clone(InitialElementPosition),
  imageHandle: clone(InitialElementPosition),
  infoZone: clone(InitialElementPosition)
}));

export function infoZoneHeightSelector(): (state: CachedModelMeasureState) => number {
  return state =>
    state.page.height -
    state.modelName.height -
    state.versionName.height -
    state.tags.height -
    state.tabs.height -
    12 * 2;
}
