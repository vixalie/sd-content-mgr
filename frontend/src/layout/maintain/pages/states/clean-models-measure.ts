import { createStore } from '@/store_creator';
import { InitialElementPosition, type ElementPosition } from '@/types';
import { clone } from 'ramda';

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
