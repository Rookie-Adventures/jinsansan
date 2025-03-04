import { CssBaseline, ThemeProvider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import type { RootState } from '@/store';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorNotification } from '@/components/ErrorNotification';
import { router } from '@/router';
import { clearError } from '@/store/slices/error';
import { createTheme } from '@/theme';

export const App = (): JSX.Element => {
  const error = useSelector((state: RootState) => state.error.current);
  const isDarkMode = useSelector((state: RootState) => state.app.darkMode);
  const dispatch = useDispatch();

  const handleErrorClose = (): void => {
    dispatch(clearError());
  };

  return (
    <ThemeProvider theme={createTheme(isDarkMode)}>
      <CssBaseline />
      <ErrorBoundary>
        <RouterProvider router={router} />
        <ErrorNotification error={error} onClose={handleErrorClose} />
      </ErrorBoundary>
    </ThemeProvider>
  );
};
