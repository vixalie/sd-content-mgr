import { createStore } from '@/store_creator';
import { models } from '@wails/go/models';
import { DeleteModelFiles, ScanDuplicateFiles } from '@wails/go/models/ModelController';
import { EventsEmit } from '@wails/runtime/runtime';
import { equals, filter, includes, map, not } from 'ramda';

type DuplicatedModelsState = {
  loading: boolean;
  deleting: boolean;
  duplicates: models.DuplicateRecord[];
  selectedFiles: string[];
};

type DuplicatedModelsAction = {
  loadDuplicatedModels: () => Promise<void>;
  selectFile: (file: string) => void;
  deleteSelected: () => Promise<void>;
};

export const useDuplicatedModels = createStore<DuplicatedModelsState & DuplicatedModelsAction>(
  (set, get) => ({
    loading: false,
    deleting: false,
    duplicates: [],
    selectedFiles: [],
    async loadDuplicatedModels() {
      set(state => ({ loading: true }));
      const duplicates = await ScanDuplicateFiles();
      set(state => ({ duplicates, selectedFiles: [], loading: false }));
    },
    selectFile(file) {
      if (!includes(file, get().selectedFiles)) {
        set(state => ({ selectedFiles: [...state.selectedFiles, file] }));
      } else {
        set(state => ({ selectedFiles: filter(f => not(equals(file, f)), state.selectedFiles) }));
      }
    },
    async deleteSelected() {
      set(state => ({ deleting: true }));
      await DeleteModelFiles(get().selectedFiles);
      EventsEmit('duplicated-model-deleted');
      const filteredDuplicates = map(
        d => ({
          files: filter(f => not(includes(f.filePath, get().selectedFiles)), d.files),
          ...d
        }),
        get().duplicates
      );
      set(state => ({ selectedFiles: [], duplicates: filteredDuplicates, deleting: false }));
    }
  })
);
