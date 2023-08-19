type UpdateWebUIState = {
  import { createStore } from '@/store_creator';
  remotes: string[];
  activeRemote: string;
  branches: string[];
  activeBranch: string;
};

type UpdateWebUIAction = {
  remotes(): Promise<void>;
};

export const useUpdateWebUIStore = createStore<UpdateWebUiState & UpdateWebUIAction>((set, get) => ({
  remotes: [],
  activeRemote: '',
  branches: [],
  activeBranch: '',
  async remotes() {
  },
}));
