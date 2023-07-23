import { createHashRouter } from 'react-router-dom';
import { About } from './layout/About.';
import { MainLayout } from './layout/MainLayout';
import { Welcome } from './layout/Welcome';
import { MaintainHost } from './layout/maintain/MaintainHost';
import { ModelHost } from './layout/models/ModelHost';
import { SetupHost } from './layout/setups/SetupHost';
import { SetupProxy } from './layout/setups/pages/proxy/SetupProxy';
import { SetupWebUI } from './layout/setups/pages/webui/SetupWebUI';

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
            element: <SetupProxy />
          },
          {
            path: 'webui',
            element: <SetupWebUI />
          },
          {
            path: 'comfy',
            element: null
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
