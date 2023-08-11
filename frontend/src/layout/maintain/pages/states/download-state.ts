import { createStore } from '@/store_creator';
import type { CacheStatus, DownloadStatus, FoundStatus } from '@/types';
import { SelectItem } from '@mantine/core';
import { entities } from '@wails/go/models';
import {
  BreakModelVersionFile,
  CheckFileNameExists,
  FetchDownloadModelVersion,
  FetchModelInfo
} from '@wails/go/models/ModelController';
import { RefreshModelInfo } from '@wails/go/remote/RemoteController';
import { equals, includes, isEmpty, not, propEq, toLower } from 'ramda';

type DownloadState = {
  url: string;
  uiTools: string;
  category: string;
  subPath: string;
  selectedVersion: number;
  modelVersionFileName: string;
  modelVersionFileExt: string;
  modelVersionFileExists: boolean;
  model: entities.Model | null;
  downloadedVersions: number[];
  modelVersionTotalSize: number;
  availableVersions: SelectItem[];
  cacheStatus: CacheStatus;
  modelDownloaded: DownloadStatus;
  versionDownloaded: DownloadStatus;
  modelFound: FoundStatus;
  overwrite: boolean;
};

type DownloadStateActions = {
  partialReset: () => void;
  setSubPath: (subPath: string) => void;
  setModel: (model: entities.Model | null) => void;
  loadModelInfo: (mdoelId: number) => Promise<void>;
  setSelectedVersion: (version: number) => Promise<void>;
  setModelVersionFilename: (filename: string) => Promise<void>;
  setDownloadedVersions: (versions: number[]) => void;
};

const initialState: DownloadState = {
  url: '',
  uiTools: 'webui',
  category: '',
  subPath: '',
  selectedVersion: 0,
  modelVersionFileName: '',
  modelVersionFileExt: '',
  modelVersionFileExists: false,
  modelVersionTotalSize: 0,
  model: null,
  downloadedVersions: [],
  availableVersions: [],
  cacheStatus: 'unknown',
  modelDownloaded: 'unknown',
  versionDownloaded: 'unknown',
  modelFound: 'unknown',
  overwrite: false
};

export const useDownloadState = createStore<DownloadState & DownloadStateActions>((set, get) => ({
  ...initialState,
  partialReset: () => {
    set(() => ({
      category: '',
      subPath: '',
      selectedVersion: 0,
      modelVersionFileName: '',
      modelVersionFileExt: '',
      modelVersionFileExists: false,
      model: null,
      downloadedVersions: [],
      availableVersions: [],
      cacheStatus: 'unknown',
      modelDownloaded: 'unknown',
      versionDownloaded: 'unknown',
      modelFound: 'unknown'
    }));
  },
  setCategory: category => {
    set(() => ({ category }));
  },
  setSubPath: subPath => {
    set(() => ({ subPath }));
  },
  loadModelInfo: async modelId => {
    await RefreshModelInfo(modelId);
    const modelInfo = await FetchModelInfo(modelId);
    const localVersions = await FetchDownloadModelVersion(modelId);
    set(() => ({
      model: modelInfo,
      category: toLower(modelInfo.type),
      availableVersions: modelInfo.versions.map(v => ({ value: v.id, label: v.versionName })),
      downloadedVersions: localVersions,
      versionDownloaded: isEmpty(localVersions) ? 'not-downloaded' : 'downloaded'
    }));
  },
  setModel: model => {
    set(() => ({
      model,
      category: toLower(model?.type ?? ''),
      availableVersions: model?.versions.map(v => ({ value: v.id, label: v.versionName })) ?? []
    }));
  },
  // 这里可以与后面的检索和拆分文件名整合
  setSelectedVersion: async selectedVersion => {
    const selectedIncluded =
      not(equals(selectedVersion, 0)) && includes(selectedVersion, get().downloadedVersions);
    set(() => ({
      selectedVersion,
      modelDownloaded: selectedIncluded ? 'downloaded' : 'not-downloaded'
    }));
    const [fileName, fileExt] = await BreakModelVersionFile(selectedVersion);
    const fileExists = await CheckFileNameExists(
      get().uiTools,
      get().subPath,
      selectedVersion,
      fileName
    );
    const selectedVersionDetail = get().model?.versions.find(propEq(selectedVersion, 'id'));
    console.log('[debug]selected version detail: ', selectedVersionDetail);
    set(() => ({
      modelVersionFileName: fileName,
      modelVersionFileExt: fileExt,
      modelVersionFileExists: fileExists
    }));
  },
  setModelVersionFilename: async modelVersionFilename => {
    const fileExists = await CheckFileNameExists(
      get().uiTools,
      get().subPath,
      get().selectedVersion,
      modelVersionFilename
    );
    set(() => ({ modelVersionFileName: modelVersionFilename, modelVersionFileExists: fileExists }));
  },
  setDownloadedVersions: downloadedVersions => {
    set(() => ({ downloadedVersions }));
  }
}));

export function overwriteStateSelector(): (state: DownloadState) => 'overwrite' | 'continuous' {
  return function (state: DownloadState): string {
    state.overwrite ? 'overwrite' : 'continuous';
  };
}
