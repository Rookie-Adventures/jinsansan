# 路由系统

## 技术栈

- React Router v6
- React.lazy() 懒加载
- React Suspense
- 自定义路由分析
- 错误边界处理

## 基础配置

### 路由定义
项目使用 `createBrowserRouter` 创建路由，主要配置文件位于 `frontend/src/router/index.tsx`：

```typescript
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
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
    ],
  },
]);
```

### 组件懒加载
使用 React.lazy() 实现组件懒加载，减少首屏加载时间：

```typescript
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));
```

## 路由分析

### 分析包装器
使用 `AnalyticsWrapper` 组件包装路由，实现路由访问追踪：

```typescript
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRouteAnalytics(); // 使用自定义 Hook 追踪路由变化
  return <>{children}</>;
};
```

### 路由分析 Hook
`useRouteAnalytics` Hook 用于收集路由相关数据：
- 路由访问记录
- 页面停留时间
- 导航类型
- 性能指标

## 错误处理

### 错误边界
使用 `ErrorWrapper` 组件处理路由级别的错误：

```typescript
const ErrorWrapper: React.FC = () => {
  const error = useRouteError();
  routerErrorHandler.handleError(error);
  return (
    <Suspense fallback={<Loading />}>
      <ErrorPage />
    </Suspense>
  );
};
```

### 错误页面
自定义错误页面组件 `ErrorPage`：

```typescript
const ErrorPage: React.FC = () => {
  const error = useRouteError() as Error;

  return (
    <Container>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Typography variant="h1" color="error" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Sorry, an unexpected error has occurred.
        </Typography>
        <Typography color="textSecondary">
          {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    </Container>
  );
};
```

## 路由守卫

### 访客守卫
`GuestGuard` 组件用于保护只允许未登录用户访问的路由：

```typescript
const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 实现访客路由保护逻辑
  return <>{children}</>;
};
```

## 布局系统

### 主布局
`MainLayout` 组件作为主要布局容器：

```typescript
const MainLayout: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <Navbar />
      <Box component="main" sx={{ 
        flexGrow: 1,
        width: '100%',
        position: 'relative',
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};
```

## 最佳实践

### 路由组织
1. 按功能模块组织路由文件
2. 使用懒加载优化加载性能
3. 为所有路由添加错误处理
4. 实现适当的路由守卫

### 性能优化
1. 组件懒加载
2. 路由预加载
3. 缓存路由组件
4. 优化加载状态展示

### 错误处理
1. 统一的错误处理机制
2. 友好的错误提示
3. 错误恢复机制
4. 错误日志记录

### 路由分析
1. 记录路由访问数据
2. 统计页面停留时间
3. 分析用户导航行为
4. 监控路由性能指标

## 注意事项

1. 避免过深的路由嵌套
2. 合理使用路由守卫
3. 处理异步加载失败
4. 优化错误提示体验
5. 定期清理路由分析数据 