import { createStore } from '@/store_creator';
import { InitialElementPosition, type ElementPosition } from '@/types';
import { clone } from 'ramda';

type RefreshModelState = {
  page: ElementPosition;
  alert: ElementPosition;
  control: ElementPosition;
};

export const useRefreshModel = createStore<RefreshModelState>(set => ({
  page: clone(InitialElementPosition),
  alert: clone(InitialElementPosition),
  control: clone(InitialElementPosition)
}));
