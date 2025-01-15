# 路由系统

## 当前实现状态 (2024年1月)

### 技术栈
- React Router v6.20.1
- React.lazy() 懒加载
- React Suspense

### 已实现功能 ✅

#### 1. 基础路由配置
```typescript
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

#### 2. 组件懒加载
```typescript
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));
```

#### 3. 路由分析
```typescript
const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRouteAnalytics();
  return <>{children}</>;
};
```

#### 4. 错误处理
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

### 已实现的页面 ✅

1. **首页** (`HomePage`)
   - 路径: `/`
   - 布局: `MainLayout`
   - 懒加载实现

2. **登录页** (`LoginPage`)
   - 路径: `/login`
   - 访客守卫保护
   - 懒加载实现

3. **错误页** (`ErrorPage`)
   - 用于处理路由错误
   - 懒加载实现

### 规划中的重要功能 📋

#### 1. 权限路由系统
- **角色基础访问控制（RBAC）**
  - 基于用户角色的路由访问控制
  - 动态路由权限配置
  - 菜单权限管理

#### 2. 高级路由功能
- **路由缓存**
  - 页面状态保持
  - 前进后退状态保存
  - 表单数据临时保存

- **路由过渡动画**
  - 页面切换动画
  - 加载状态过渡
  - 错误状态过渡

#### 3. 性能优化计划
- **路由预加载**
  - 智能预加载策略
  - 基于用户行为的预测加载
  - 资源优先级控制

- **代码分割策略**
  - 基于路由的代码分割
  - 公共依赖提取
  - 动态导入优化

### 已实现的核心功能 ✅

#### 1. 路由守卫
- 访客守卫 (`GuestGuard`)：保护登录页面
- 路由分析：记录路由访问

#### 2. 错误处理
- 统一的错误处理机制
- 错误页面展示
- 错误日志记录

#### 3. 性能优化
- 组件懒加载
- Suspense 加载状态
- 路由级别代码分割

### 使用示例

#### 1. 基础路由导航
```typescript
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/login');
  };
};
```

#### 2. 路由守卫使用
```typescript
const ProtectedRoute = () => {
  return (
    <GuestGuard>
      <Component />
    </GuestGuard>
  );
};
```

#### 3. 错误处理
```typescript
const ErrorComponent = () => {
  const error = useRouteError();
  return <div>{error.message}</div>;
};
``` 