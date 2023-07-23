import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { equals } from 'ramda';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { EventBusContext, eventBus } from './EventBus';
import { AppRoute } from './app-routes';
import { useAppTheme } from './theme';

const queryClient = new QueryClient();

function AppMain() {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const updateColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (equals(colorScheme, 'dark') ? 'light' : 'dark'));
  const theme = useAppTheme(preferredColorScheme);

  return (
    <EventBusContext.Provider value={eventBus}>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={updateColorScheme}>
          <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
            <Notifications position="bottom-right" limit={5} zIndex={999} />
            <ModalsProvider>
              <RouterProvider router={AppRoute} />
            </ModalsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </EventBusContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppMain />
  </React.StrictMode>
);
