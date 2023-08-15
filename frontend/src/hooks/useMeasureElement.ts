import { useResizeObserver } from '@react-hookz/web';
import { lensProp, set } from 'ramda';
import { RefObject } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

export function useMeasureElement<T>(
  ref: RefObject<Element> | Element | null,
  measureStore: UseBoundStore<StoreApi<T>>,
  field: string,
  enabled: boolean = true
): void {
  useResizeObserver(
    ref,
    entry => {
      const { x, y, top, left, bottom, right, width, height } = entry.contentRect;
      measureStore.setState(
        set(lensProp(field), { x, y, top, left, bottom, right, width, height })
      );
    },
    enabled
  );
}
