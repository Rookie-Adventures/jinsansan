import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { ThemeToggle } from '@/components/common';
import { LoadingBar, Toast } from '@/components/feedback';
import { useAppSelector } from '@/hooks';
import { router } from '@/router';
import { theme } from '@/theme';

export const App = () => {
  const isDarkMode = useAppSelector((state) => state.app.darkMode);

  return (
    <ThemeProvider theme={theme(isDarkMode)}>
      <CssBaseline />
      <Box sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 1100,
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: '50%',
        boxShadow: 3,
      }}>
        <ThemeToggle />
      </Box>
      <LoadingBar />
      <Toast />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
