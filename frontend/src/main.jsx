import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { EventBusContext, eventBus } from './EventBus';
import { AppRoute } from './app-routes';
import { useAppTheme } from './theme';

function AppMain() {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const updateColorScheme = value =>
    setColorScheme(value || (equals(colorScheme, 'dark') ? 'light' : 'dark'));
  const theme = useAppTheme(preferredColorScheme);

  return (
    <EventBusContext.Provider value={eventBus}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={updateColorScheme}>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <Notifications position="bottom-right" limit={5} zIndex={999} />
          <ModalsProvider>
            <RouterProvider router={AppRoute} />
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </EventBusContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppMain />
  </React.StrictMode>
);
