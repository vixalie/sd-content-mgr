import { createStore } from '@/store_creator';
import type { ElementPosition } from '@/types';
import { clone } from 'ramda';

const InitialElementPosition: ElementPosition = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0
};

type CleanModelsMeasureState = {
  page: ElementPosition;
  alert: ElementPosition;
  tabs: ElementPosition;
  panel: ElementPosition;
  control: ElementPosition;
  content: ElementPosition;
};

export const useCleanModelsMeasure = createStore<CleanModelsMeasureState>(set => ({
  page: clone(InitialElementPosition),
  alert: clone(InitialElementPosition),
  tabs: clone(InitialElementPosition),
  panel: clone(InitialElementPosition),
  control: clone(InitialElementPosition),
  content: clone(InitialElementPosition)
}));
