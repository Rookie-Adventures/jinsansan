import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/common/layout/MainLayout';
import ErrorPage from '../pages/ErrorPage';
import HomePage from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // 其他路由配置将在这里添加
    ],
  },
]); 