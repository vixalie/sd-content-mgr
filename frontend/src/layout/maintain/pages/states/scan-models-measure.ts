import { createStore } from '@/store_creator';
import { InitialElementPosition, type ElementPosition } from '@/types';
import { clone } from 'ramda';

type ScanModelsMeasureState = {
  page: ElementPosition;
  alert: ElementPosition;
  control: ElementPosition;
};

export const useScanModelsMeasure = createStore<ScanModelsMeasureState>(set => ({
  page: clone(InitialElementPosition),
  alert: clone(InitialElementPosition),
  control: clone(InitialElementPosition)
}));
