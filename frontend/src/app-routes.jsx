import { createMemoryRouter } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Welcome } from './layout/Welcome';
import { MaintainHost } from './layout/maintain/MaintainHost';
import { ModelHost } from './layout/models/ModelHost';
import { SetupHost } from './layout/setups/SetupHost';

export const AppRoute = createMemoryRouter([
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
        path: '/model',
        element: <ModelHost />
      },
      {
        path: '/maintain',
        element: <MaintainHost />
      },
      {
        path: '/setup',
        element: <SetupHost />
      }
    ]
  }
]);
