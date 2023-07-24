import { createHashRouter } from 'react-router-dom';
import { About } from './layout/About.';
import { MainLayout } from './layout/MainLayout';
import { Welcome } from './layout/Welcome';
import { MaintainHost } from './layout/maintain/MaintainHost';
import { ModelHost } from './layout/models/ModelHost';
import { SetupHost } from './layout/setups/SetupHost';
import { SetupComfyUI } from './layout/setups/pages/comfyui/SetupComfyUI';
import { loadComfyUIConfig } from './layout/setups/pages/comfyui/hooks/useComfyUI';
import { SetupProxy } from './layout/setups/pages/proxy/SetupProxy';
import { loadProxyConfigData } from './layout/setups/pages/proxy/hooks/useProtocols';
import { SetupWebUI } from './layout/setups/pages/webui/SetupWebUI';
import { loadWebUIConfig } from './layout/setups/pages/webui/hooks/useWebUI';

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
        element: <ModelHost />
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
