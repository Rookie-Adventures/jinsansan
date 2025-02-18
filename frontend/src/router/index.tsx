import React, { Suspense } from 'react';
import { createBrowserRouter, useRouteError } from 'react-router-dom';

import Loading from '@/components/common/Loading';
import MainLayout from '@/components/common/layout/MainLayout';
import { AuthGuard, GuestGuard } from '@/router/guards';
import { useRouteAnalytics } from '@/utils/router/analytics';
import { routerErrorHandler } from '@/utils/router/error-handler';

const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));

// 路由分析包装器
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRouteAnalytics();
  return <>{children}</>;
};

// 错误边界包装器
const ErrorWrapper: React.FC = () => {
  const error = useRouteError();
  routerErrorHandler.handleError(error);
  return (
    <Suspense fallback={<Loading />}>
      <ErrorPage />
    </Suspense>
  );
};

// 导出路由配置数组
export const routes = [
  {
    path: '/login',
    element: (
      <AnalyticsWrapper>
        <GuestGuard>
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        </GuestGuard>
      </AnalyticsWrapper>
    ),
    errorElement: <ErrorWrapper />,
  },
  {
    path: '/register',
    element: (
      <AnalyticsWrapper>
        <GuestGuard>
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        </GuestGuard>
      </AnalyticsWrapper>
    ),
    errorElement: <ErrorWrapper />,
  },
  {
    path: '/',
    element: (
      <AnalyticsWrapper>
        <MainLayout />
      </AnalyticsWrapper>
    ),
    errorElement: <ErrorWrapper />,
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
        path: 'dashboard',
        element: (
          <AuthGuard>
            <Suspense fallback={<Loading />}>
              <HomePage />
            </Suspense>
          </AuthGuard>
        ),
      },
      // 其他需要认证的路由配置将在这里添加
    ],
  },
];

export const router = createBrowserRouter(routes);
