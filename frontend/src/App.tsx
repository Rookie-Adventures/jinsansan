import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { LoadingBar, Toast } from '@/components/feedback';
import { useAppSelector } from '@/hooks';
import { router } from '@/router';
import { theme } from '@/theme';

export const App = () => {
  const isDarkMode = useAppSelector((state) => state.app.darkMode);

  return (
    <ThemeProvider theme={theme(isDarkMode)}>
      <CssBaseline />
      <LoadingBar />
      <Toast />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
