import { createHashRouter } from 'react-router-dom';
import { About } from './layout/About.';
import { MainLayout } from './layout/MainLayout';
import { Welcome } from './layout/Welcome';
import { MaintainHost } from './layout/maintain/MaintainHost';
import { ModelHost } from './layout/models/ModelHost';
import { CachedModel } from './layout/models/pages/CachedModel';
import { UncachedModel } from './layout/models/pages/UncachedModel';
import { SetupHost } from './layout/setups/SetupHost';
import { SetupComfyUI } from './layout/setups/pages/comfyui/SetupComfyUI';
import { loadComfyUIConfig } from './layout/setups/pages/comfyui/hooks/useComfyUI';
import { SetupProxy } from './layout/setups/pages/proxy/SetupProxy';
import { loadProxyConfigData } from './layout/setups/pages/proxy/hooks/useProtocols';
import { SetupWebUI } from './layout/setups/pages/webui/SetupWebUI';
import { loadWebUIConfig } from './layout/setups/pages/webui/hooks/useWebUI';
import {
  checkModelVersionDownloaded,
  loadCachedVersionInfo,
  loadSameSerialVersions
} from './queries/cached-files';
import { loadUncachedFileInfo } from './queries/uncached-file';

export const AppRoute = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        index: true,
        element: <Welcome />
      },
      {
        path: 'model',
        element: <ModelHost />,
        children: [
          {
            path: 'uncached/:fileId',
            element: <UncachedModel />,
            loader: loadUncachedFileInfo
          },
          {
            path: 'version/:modelVersionId',
            element: <CachedModel />,
            loader: async ({ params }) => {
              const fileInfo = await loadCachedVersionInfo(params);
              const versions = await loadSameSerialVersions(params);
              const versionDownloaded = await checkModelVersionDownloaded(params);
              return [fileInfo, versions, versionDownloaded];
            }
          }
        ]
      },
      {
        path: 'maintain',
        element: <MaintainHost />
      },
      {
        path: 'setup',
        element: <SetupHost />,
        children: [
          {
            path: 'proxy',
            element: <SetupProxy />,
            loader: loadProxyConfigData
          },
          {
            path: 'webui',
            element: <SetupWebUI />,
            loader: loadWebUIConfig
          },
          {
            path: 'comfy',
            element: <SetupComfyUI />,
            loader: loadComfyUIConfig
          }
        ]
      },
      {
        path: 'about',
        element: <About />
      }
    ]
  }
]);
