# 认证系统

## 概述

认证系统采用基于 Token 的认证方式，使用 Redux 进行状态管理，并通过 MSW (Mock Service Worker) 提供模拟服务。

## 技术栈

- **状态管理**: Redux Toolkit + Redux Persist
- **路由**: React Router v6
- **请求处理**: Axios
- **Mock 服务**: MSW (Mock Service Worker)
- **类型检查**: TypeScript
- **UI 组件**: Material UI v5

## 核心功能

### 1. 状态管理

#### Redux Store 结构
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

#### Actions
- `login`: 处理用户登录
- `register`: 处理用户注册
- `logout`: 处理用户退出
- `getCurrentUser`: 获取当前用户信息
- `clearAuth`: 清除认证状态
- `clearError`: 清除错误信息

#### 状态持久化
使用 `redux-persist` 持久化认证状态：
```typescript
// 配置
{
  key: 'root',
  storage: localStorage,
  whitelist: ['auth']
}

// 清除方式
localStorage.removeItem('persist:root')
```

### 2. API 接口

所有接口遵循统一的响应格式：
```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

#### 登录
```typescript
POST /auth/login
Request: {
  username: string;
  password: string;
}
Response: {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  }
}
```

#### 注册
```typescript
POST /auth/register
Request: {
  username: string;
  password: string;
  email: string;
}
```

#### 退出登录
```typescript
POST /auth/logout
```

#### 获取用户信息
```typescript
GET /auth/me
Headers: {
  Authorization: 'Bearer <token>'
}
```

### 3. 路由守卫

#### AuthGuard
```typescript
// 保护需要认证的路由
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

#### GuestGuard
```typescript
// 保护仅供未认证用户访问的路由
<GuestGuard>
  <GuestOnlyComponent />
</GuestGuard>
```

### 4. 错误处理

#### 错误类型
- 401: 未授权/token 失效
- 400: 请求参数错误
- 500: 服务器错误

#### 错误消息
- 登录失败：用户名或密码错误
- 注册失败：用户名已存在/邮箱已被使用
- 认证失败：token 失效/未授权
- 退出失败：退出登录失败，请重试

## 最佳实践

### 1. 状态清理
退出登录时的完整流程：
```typescript
const handleLogout = async () => {
  try {
    await dispatch(logout()).unwrap();
    dispatch(clearAuth());
    localStorage.removeItem('persist:root');
    navigate('/login');
  } catch (err) {
    // 即使退出失败，也清除本地状态
    dispatch(clearAuth());
    localStorage.removeItem('persist:root');
    navigate('/login');
  }
};
```

### 2. 错误恢复
```typescript
try {
  await dispatch(login(data)).unwrap();
  navigate('/');
} catch (err) {
  if (isAuthError(err)) {
    navigate('/login');
  }
  throw err;
}
```

### 3. 安全考虑
1. 使用 HTTPS 传输
2. Token 存储在内存中
3. 敏感操作需要重新验证
4. 定期刷新 token

## Mock 服务

### 1. 测试账号
```typescript
{
  username: 'test',
  password: 'test',
  email: 'test@example.com'
}
```

### 2. 性能优化
- 登录/注册响应时间：< 1秒
- 获取用户信息：< 500ms
- 退出登录：< 300ms

### 3. 错误模拟
- 用户名/密码错误
- 用户名/邮箱已存在
- Token 失效
- 网络错误

## 使用示例

### 1. 登录
```typescript
const { login, loading, error } = useAuth();

const handleLogin = async (data: LoginFormData) => {
  try {
    await login(data);
    // 登录成功，自动跳转到首页
  } catch (error) {
    // 错误处理
  }
};
```

### 2. 路由保护
```typescript
// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
  },
]);
```

### 3. 获取用户信息
```typescript
const { user, isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    // 可以访问用户信息
    console.log(user?.username);
  }
}, [isAuthenticated, user]);
``` 