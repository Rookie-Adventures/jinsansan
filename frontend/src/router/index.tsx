import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '@/components/common/layout/MainLayout';
import Loading from '@/components/common/Loading';
import { GuestGuard } from '@/router/guards';

const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: (
      <Suspense fallback={<Loading />}>
        <ErrorPage />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestGuard>
            <Suspense fallback={<Loading />}>
              <LoginPage />
            </Suspense>
          </GuestGuard>
        ),
      },
      // 其他路由配置将在这里添加
    ],
  },
]); 