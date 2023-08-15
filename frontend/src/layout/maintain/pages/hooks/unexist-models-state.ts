import { createStore } from '@/store_creator';
import { entities } from '@wails/go/models';
import { CheckUnexistCaches, DeleteCaches } from '@wails/go/models/ModelController';
import { EventsEmit } from '@wails/runtime/runtime';
import { equals, filter, includes, not } from 'ramda';

type UnexistModelsState = {
  unexists: entities.FileCache[];
  loading: boolean;
  deleting: boolean;
  selectedRecords: string[];
};

type UnexistModelsAction = {
  loadUnexists: () => Promise<void>;
  selectRecord: (record: string) => void;
  deleteRecords: () => Promise<void>;
};

export const useUnexistModels = createStore<UnexistModelsState & UnexistModelsAction>(
  (set, get) => ({
    unexists: [],
    loading: false,
    deleting: false,
    selectedRecords: [],
    async loadUnexists() {
      set(state => ({ loading: true }));
      const unexists = await CheckUnexistCaches();
      set(state => ({ unexists, selectedRecords: [], loading: false }));
    },
    selectRecord(record) {
      if (!includes(record, get().selectedRecords)) {
        set(state => ({ selectedRecords: [...state.selectedRecords, record] }));
      } else {
        set(state => ({
          selectedRecords: filter(r => not(equals(record, r)), state.selectedRecords)
        }));
      }
    },
    async deleteRecords() {
      set(state => ({ deleting: true }));
      await DeleteCaches(get().selectedRecords);
      EventsEmit('invalid-cache-deleted');
      set(state => ({ deleting: false }));
      await get().loadUnexists();
    }
  })
);
