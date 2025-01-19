import { CssBaseline, ThemeProvider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorNotification } from '@/components/ErrorNotification';
import { router } from '@/router';
import type { RootState } from '@/store';
import { clearError } from '@/store/slices/error';
import { theme } from '@/theme';

export const App = () => {
  const error = useSelector((state: RootState) => state.error.current);
  const isDarkMode = useSelector((state: RootState) => state.app.darkMode);
  const dispatch = useDispatch();

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  return (
    <ThemeProvider theme={theme(isDarkMode)}>
      <CssBaseline />
      <ErrorBoundary>
        <RouterProvider router={router} />
        <ErrorNotification error={error} onClose={handleErrorClose} />
      </ErrorBoundary>
    </ThemeProvider>
  );
};
