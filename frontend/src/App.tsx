import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';

import { LoadingBar, Toast } from '@/components/feedback';
import { useAppSelector } from '@/hooks';
import { router } from '@/router';
import { theme } from '@/theme';
import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';

export const App = () => {
  const isDarkMode = useAppSelector((state) => state.app.darkMode);

  useEffect(() => {
    // 初始化性能监控
    const monitor = PerformanceMonitor.getInstance();
    // 监控器会自动开始收集数据
    
    // 开发环境下打印性能数据
    if (process.env.NODE_ENV === 'development') {
      console.info('Performance monitoring initialized');
    }
  }, []);

  return (
    <ThemeProvider theme={theme(isDarkMode)}>
      <CssBaseline />
      <LoadingBar />
      <Toast />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
