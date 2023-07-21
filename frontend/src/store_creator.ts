//@ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { create, State, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface EnhancedStoreType<StoreType> {
  use: {
    [key in keyof StoreType]: () => StoreType[key];
  };
  reset: () => void;
}

type CreateStoreHookOptions = {
  debug?: boolean;
};

/**
 * 自动为一个Store Hook创建快速访问其中状态和Action的选择器。
 */
function createSelectors<StoreType extends State>(
  store: UseBoundStore<StoreApi<StoreType>>,
  debug?: boolean
): UseBoundStore<StoreApi<StoreType>> & EnhancedStoreType<StoreType> {
  const initialState = store.getState();
  (store as unknown).use = {};

  Object.keys(store.getState()).forEach(key => {
    const selector = (state: StoreType) => state[key as keyof StoreType];
    (store as unknown).use[key] = () => store(selector);
  });
  (store as unknown).reset = () => store.setState(initialState, true);

  if (debug ?? false) {
    store.subscribe((current, previous) => {
      console.log('[状态调试]Action应用前: ', previous);
      console.log('[状态调试]Action应用后: ', current);
    });
  }

  return store as UseBoundStore<StoreType> & EnhancedStoreType<StoreType>;
}

/**
 * 自动嵌套使用Devtools和Immer中间件的Zustand创建Store Hook的函数。
 * 同时将会自动应用创建快速访问状态和Action的选择器。
 */
export const createStoreHook = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, [...Mps, ['zustand/immer', never]], Mcs>,
  options?: CreateStoreHookOptions
): UseBoundStore<StoreApi<T>> & EnhancedStoreType<T> =>
  createSelectors(create<T>()(immer(initializer)), options?.debug ?? false);
