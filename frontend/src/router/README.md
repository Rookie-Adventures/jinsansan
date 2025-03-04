# 路由模块 (Router)

## 目录结构

```
router/
├── guards/         # 路由守卫
├── index.tsx       # 路由配置
├── guards.tsx      # 路由守卫配置
└── __tests__/      # 测试文件
```

## 路由规范

### 命名规范
- 路由文件使用 camelCase 命名（如 `authRoutes.tsx`）
- 路由目录使用 kebab-case 命名（如 `route-guards`）
- 测试文件使用 `.test.tsx` 后缀

### 路由结构
```typescript
// 路由模板
import { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },
];
```

## 路由分类

### 1. 路由守卫 (guards/)
- `AuthGuard`: 认证守卫
- `GuestGuard`: 访客守卫
- `RoleGuard`: 角色守卫
- `PermissionGuard`: 权限守卫

### 2. 路由配置
- `index.tsx`: 主路由配置
- `guards.tsx`: 路由守卫配置

## 使用示例

### 路由配置使用
```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';

export const App = () => {
  return <RouterProvider router={router} />;
};
```

### 路由守卫使用
```tsx
import { AuthGuard } from '@/router/guards/AuthGuard';

export const ProtectedRoute = () => {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
};
```

### 路由参数使用
```tsx
import { useParams } from 'react-router-dom';

export const UserPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      User ID: {id}
    </div>
  );
};
```

## 最佳实践

1. **路由设计**
   - 使用嵌套路由
   - 实现路由懒加载
   - 统一路由配置

2. **性能优化**
   - 使用路由懒加载
   - 优化路由切换
   - 缓存路由组件

3. **测试规范**
   - 编写单元测试
   - 测试路由守卫
   - 测试路由参数

4. **安全处理**
   - 实现路由权限控制
   - 处理路由重定向
   - 保护敏感路由

## 注意事项

1. 路由开发时需要考虑：
   - 路由的可维护性
   - 路由的安全性
   - 路由的性能表现
   - 路由的用户体验

2. 路由使用时的注意事项：
   - 正确处理路由参数
   - 处理路由权限
   - 遵循路由规范

## 更新日志

### v1.0.0
- 初始化路由模块
- 实现基础路由
- 添加路由文档 