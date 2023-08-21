import { createStore } from '@/store_creator';
import { notifications } from '@mantine/notifications';
import {
  Branches,
  CheckDifference,
  Checkout,
  CurrentBranch,
  CurrentRemote,
  Fetch,
  Pull,
  Remotes
} from '@wails/go/git/GitController';
import { isEmpty } from 'ramda';

type UpdateComfyUIState = {
  remotes: string[];
  selectedRemote: string;
  activeRemote: string;
  branches: string[];
  selectedBranch: string;
  activeBranch: string;
  difference: number;
};

type UpdateComfyUIAction = {
  loadRemotes(comfyUiDir: string): Promise<void>;
  loadBranches(comfyUiDir: string): Promise<void>;
  refreshDifference(comfyUiDir: string): Promise<void>;
  fetchUpdates(comfyUiDir: string): Promise<void>;
  checkoutBranch(comfyUiDir: string): Promise<void>;
  doUpdate(comfyUiDir: string): Promise<void>;
};

export const useUpdateComfyUI = createStore<UpdateComfyUIState & UpdateComfyUIAction>(
  (set, get) => ({
    remotes: [],
    selectedRemote: '',
    activeRemote: '',
    branches: [],
    selectedBranch: '',
    activeBranch: '',
    difference: 0,
    async loadRemotes(comfyUiDir) {
      try {
        const remotes = await Remotes(comfyUiDir);
        const currentRemote = await CurrentRemote(comfyUiDir);
        set(state => ({ remotes, selectedRemote: currentRemote, activeRemote: currentRemote }));
      } catch (e) {
        console.error('[error]获取ComfyUI远程版本库', e);
        notifications.show({
          title: '获取ComfyUI更新失败',
          message: '无法获取SD ComfyUI的更新源。',
          color: 'red',
          withCloseButton: false
        });
      }
    },
    async loadBranches(comfyUiDir) {
      try {
        const branches = await Branches(comfyUiDir);
        const currentBranch = await CurrentBranch(comfyUiDir);
        set(state => ({ branches, selectedBranch: currentBranch, activeBranch: currentBranch }));
      } catch (e) {
        console.error('[error]获取ComfyUI分支', e);
        notifications.show({
          title: '获取ComfyUI分支失败',
          message: '无法获取SD ComfyUI的分支。',
          color: 'red',
          withCloseButton: false
        });
      }
    },
    async refreshDifference(comfyUiDir) {
      try {
        if (isEmpty(get().selectedRemote) || isEmpty(get().selectedBranch)) {
          throw new Error('不能确定SD ComfyUI的远程版本库或分支。');
        }
        const difference = await CheckDifference(
          comfyUiDir,
          get().selectedRemote,
          get().selectedBranch
        );
        set(state => ({ difference }));
      } catch (e) {
        console.error('[error]更新ComfyUI版本库提交差距', e);
        notifications.show({
          title: '获取更新状态',
          message: `未能获取SD ComfyUI的更新状态，${e.message}`,
          color: 'red',
          withCloseButton: false
        });
      }
    },
    async fetchUpdates(comfyUiDir) {
      try {
        if (isEmpty(get().selectedRemote)) {
          throw new Error('不能确定SD ComfyUI的远程版本库。');
        }
        await Fetch(comfyUiDir, get().selectedRemote);
        const difference = await CheckDifference(
          comfyUiDir,
          get().selectedRemote,
          get().selectedBranch
        );
        set(state => ({ difference }));
      } catch (e) {
        console.error('[error]更新ComfyUI版本库', e);
        notifications.show({
          title: '更新ComfyUI版本库',
          message: `未能更新SD ComfyUI的版本库，${e.message}`,
          color: 'red',
          withCloseButton: false
        });
      }
    },
    async checkoutBranch(comfyUiDir) {
      try {
        if (isEmpty(get().selectedBranch)) {
          throw new Error('不能确定SD ComfyUI的分支。');
        }
        await Checkout(comfyUiDir, get().selectedBranch);
        const currentBranch = await CurrentBranch(comfyUiDir);
        set(state => ({ activeBranch: currentBranch }));
      } catch (e) {
        console.error('[error]检出ComfyUI分支', e);
        notifications.show({
          title: '检出ComfyUI分支',
          message: `未能检出SD ComfyUI的分支，${e.message}`,
          color: 'red',
          withCloseButton: false
        });
      }
    },
    async doUpdate(comfyUiDir) {
      try {
        if (isEmpty(get().selectedRemote) || isEmpty(get().selectedBranch)) {
          throw new Error('不能确定SD ComfyUI的远程版本库或分支。');
        }
        await Pull(comfyUiDir, get().selectedRemote, get().selectedBranch);
        const difference = await CheckDifference(
          comfyUiDir,
          get().selectedRemote,
          get().selectedBranch
        );
        set(state => ({ difference }));
      } catch (e) {
        console.error('[error]更新ComfyUI版本库', e);
        notifications.show({
          title: '更新ComfyUI版本库',
          message: `未能更新SD ComfyUI的版本库，${e.message}`,
          color: 'red',
          withCloseButton: false
        });
      }
    }
  })
);
