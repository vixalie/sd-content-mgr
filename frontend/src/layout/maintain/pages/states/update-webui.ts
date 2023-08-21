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

type UpdateWebUIState = {
  remotes: string[];
  selectedRemote: string;
  activeRemote: string;
  branches: string[];
  selectedBranch: string;
  activeBranch: string;
  difference: number;
};

type UpdateWebUIAction = {
  loadRemotes(webUiDir: string): Promise<void>;
  loadBranches(webUiDir: string): Promise<void>;
  refreshDifference(webUiDir: string): Promise<void>;
  fetchUpdates(webUiDir: string): Promise<void>;
  checkoutBranch(webUiDir: string): Promise<void>;
  doUpdate(webUiDir: string): Promise<void>;
};

export const useUpdateWebUI = createStore<UpdateWebUIState & UpdateWebUIAction>((set, get) => ({
  remotes: [],
  selectedRemote: '',
  activeRemote: '',
  branches: [],
  selectedBranch: '',
  activeBranch: '',
  difference: 0,
  async loadRemotes(webUIDir) {
    try {
      const remotes = await Remotes(webUIDir);
      const currentRemote = await CurrentRemote(webUIDir);
      set(state => ({ remotes, selectedRemote: currentRemote, activeRemote: currentRemote }));
    } catch (e) {
      console.error('[error]获取WebUI远程版本库', e);
      notifications.show({
        title: '获取WebUI更新失败',
        message: '无法获取SD WebUI的更新源。',
        color: 'red',
        withCloseButton: false
      });
    }
  },
  async loadBranches(webUIDir) {
    try {
      const branches = await Branches(webUIDir);
      const currentBranch = await CurrentBranch(webUIDir);
      set(state => ({ branches, selectedBranch: currentBranch, activeBranch: currentBranch }));
    } catch (e) {
      console.error('[error]获取WebUI分支', e);
      notifications.show({
        title: '获取WebUI分支失败',
        message: '无法获取SD WebUI的分支。',
        color: 'red',
        withCloseButton: false
      });
    }
  },
  async refreshDifference(webUiDir) {
    try {
      if (isEmpty(get().selectedRemote) || isEmpty(get().selectedBranch)) {
        throw new Error('不能确定SD WebUI的远程版本库或分支。');
      }
      const difference = await CheckDifference(
        webUiDir,
        get().selectedRemote,
        get().selectedBranch
      );
      set(state => ({ difference }));
    } catch (e) {
      console.error('[error]更新WebUI版本库提交差距', e);
      notifications.show({
        title: '获取更新状态',
        message: `未能获取SD WebUI的更新状态，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  },
  async fetchUpdates(webUiDir) {
    try {
      if (isEmpty(get().selectedRemote)) {
        throw new Error('不能确定SD WebUI的远程版本库。');
      }
      await Fetch(webUiDir, get().selectedRemote);
      const difference = await CheckDifference(
        webUiDir,
        get().selectedRemote,
        get().selectedBranch
      );
      set(state => ({ difference }));
    } catch (e) {
      console.error('[error]更新WebUI版本库', e);
      notifications.show({
        title: '更新WebUI版本库',
        message: `未能更新SD WebUI的版本库，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  },
  async checkoutBranch(webUiDir) {
    try {
      if (isEmpty(get().selectedBranch)) {
        throw new Error('不能确定SD WebUI的分支。');
      }
      await Checkout(webUiDir, get().selectedBranch);
      const currentBranch = await CurrentBranch(webUiDir);
      set(state => ({ activeBranch: currentBranch }));
    } catch (e) {
      console.error('[error]检出WebUI分支', e);
      notifications.show({
        title: '检出WebUI分支',
        message: `未能检出SD WebUI的分支，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  },
  async doUpdate(webUiDir) {
    try {
      if (isEmpty(get().selectedRemote) || isEmpty(get().selectedBranch)) {
        throw new Error('不能确定SD WebUI的远程版本库或分支。');
      }
      await Pull(webUiDir, get().selectedRemote, get().selectedBranch);
      const difference = await CheckDifference(
        webUiDir,
        get().selectedRemote,
        get().selectedBranch
      );
      set(state => ({ difference }));
    } catch (e) {
      console.error('[error]更新WebUI版本库', e);
      notifications.show({
        title: '更新WebUI版本库',
        message: `未能更新SD WebUI的版本库，${e.message}`,
        color: 'red',
        withCloseButton: false
      });
    }
  }
}));
