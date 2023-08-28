import { createHashRouter } from 'react-router-dom';
import { About } from './layout/About.';
import { MainLayout } from './layout/MainLayout';
import { Welcome } from './layout/Welcome';
import { MaintainHost } from './layout/maintain/MaintainHost';
import { CleanModels } from './layout/maintain/pages/CleanModels';
import { DownloadModel } from './layout/maintain/pages/DownloadModel';
import { RefreshModel } from './layout/maintain/pages/RefreshModel';
import { ScanModel } from './layout/maintain/pages/ScanModel';
import { UpdateComfyUI } from './layout/maintain/pages/UpdateComfyUI';
import { UpdateComfyUINodes } from './layout/maintain/pages/UpdateComfyUINodes';
import { UpdateErrors } from './layout/maintain/pages/UpdateErrors';
import { UpdateWebUI } from './layout/maintain/pages/UpdateWebUI';
import { UpdateWebUIExtension } from './layout/maintain/pages/UpdateWebUIExtension';
import { ModelHost } from './layout/models/ModelHost';
import { CachedModel } from './layout/models/pages/CachedModel';
import { UncachedModel } from './layout/models/pages/UncachedModel';
import { SetupHost } from './layout/setups/SetupHost';
import { Behaviours } from './layout/setups/pages/app/Behaviours';
import { SetupComfyUI } from './layout/setups/pages/comfyui/SetupComfyUI';
import { loadComfyUIConfig } from './layout/setups/pages/comfyui/hooks/useComfyUI';
import { SetupProxy } from './layout/setups/pages/proxy/SetupProxy';
import { loadProxyConfigData } from './layout/setups/pages/proxy/hooks/useProtocols';
import { SetupWebUI } from './layout/setups/pages/webui/SetupWebUI';
import { loadWebUIConfig } from './layout/setups/pages/webui/hooks/useWebUI';
import { ToolsHost } from './layout/tools/ToolsHost';
import {
  checkModelVersionDownloaded,
  loadCachedVersionInfo,
  loadSameSerialVersions
} from './queries/cached-files';
import {
  loadAppBehaviours,
  loadComfyUICustomNodes,
  loadComfyUISettings,
  loadWebUIExtensions,
  loadWebUISettings
} from './queries/load-settings';
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
        element: <MaintainHost />,
        children: [
          {
            path: 'download',
            element: <DownloadModel />
          },
          {
            path: 'scan',
            element: <ScanModel />
          },
          {
            path: 'cleanup',
            element: <CleanModels />
          },
          {
            path: 'update/webui',
            element: <UpdateWebUI />,
            loader: loadWebUISettings
          },
          {
            path: 'update/webui-extension',
            element: <UpdateWebUIExtension />,
            loader: loadWebUIExtensions,
            errorElement: <UpdateErrors />
          },
          {
            path: 'update/comfy',
            element: <UpdateComfyUI />,
            loader: loadComfyUISettings
          },
          {
            path: 'update/comfy-nodes',
            element: <UpdateComfyUINodes />,
            loader: loadComfyUICustomNodes,
            errorElement: <UpdateErrors />
          },
          {
            path: 'refresh',
            element: <RefreshModel />
          }
        ]
      },
      {
        path: 'tools',
        element: <ToolsHost />,
        children: []
      },
      {
        path: 'setup',
        element: <SetupHost />,
        children: [
          {
            path: 'app',
            element: <Behaviours />,
            loader: loadAppBehaviours
          },
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
