# 组件模块 (Components)

## 目录结构

```
components/
├── README.md
├── common/          # 通用组件
│   ├── Button/      # 按钮组件
│   ├── Input/       # 输入框组件
│   ├── Modal/       # 模态框组件
│   └── Table/       # 表格组件
├── layout/          # 布局组件
│   ├── Header/      # 头部组件
│   ├── Footer/      # 底部组件
│   ├── Sidebar/     # 侧边栏组件
│   └── Container/   # 容器组件
├── forms/           # 表单组件
│   ├── LoginForm/   # 登录表单
│   ├── RegisterForm/# 注册表单
│   └── SearchForm/  # 搜索表单
└── business/        # 业务组件
    ├── UserCard/    # 用户卡片
    ├── ProductList/ # 产品列表
    └── OrderTable/  # 订单表格
```

## 组件规范

### 命名规则
- 组件文件使用 PascalCase 命名（如 `UserCard.tsx`）
- 组件目录使用 PascalCase 命名（如 `UserCard/`）
- 测试文件使用 `.test.tsx` 后缀
- 样式文件使用 `.styles.ts` 后缀

### 组件结构
```typescript
// 组件模板
import { FC } from 'react';
import { User } from '@shared/types';
import { useStyles } from './UserCard.styles';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const styles = useStyles();

  return (
    <div className={styles.card}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {/* 组件内容 */}
    </div>
  );
};
```

## 组件分类

### 1. 通用组件 (common/)
- `Button`: 按钮组件
- `Input`: 输入框组件
- `Modal`: 模态框组件
- `Table`: 表格组件
- `Select`: 选择器组件
- `DatePicker`: 日期选择器

### 2. 布局组件 (layout/)
- `Header`: 页面头部
- `Footer`: 页面底部
- `Sidebar`: 侧边栏
- `Container`: 内容容器
- `Grid`: 网格布局
- `Card`: 卡片容器

### 3. 表单组件 (forms/)
- `LoginForm`: 登录表单
- `RegisterForm`: 注册表单
- `SearchForm`: 搜索表单
- `FilterForm`: 筛选表单
- `SettingsForm`: 设置表单

### 4. 业务组件 (business/)
- `UserCard`: 用户信息卡片
- `ProductList`: 产品列表
- `OrderTable`: 订单表格
- `Dashboard`: 仪表盘
- `Statistics`: 统计图表

## 使用示例

### 通用组件使用
```typescript
import { Button, Input } from '@/components/common';

const LoginForm = () => {
  return (
    <form>
      <Input
        type="text"
        placeholder="Username"
        onChange={(e) => console.log(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        onChange={(e) => console.log(e.target.value)}
      />
      <Button type="submit">Login</Button>
    </form>
  );
};
```

### 业务组件使用
```typescript
import { UserCard } from '@/components/business';
import { User } from '@shared/types';

const UserProfile = () => {
  const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  return (
    <UserCard
      user={user}
      onEdit={(user) => console.log('Edit user:', user)}
      onDelete={(userId) => console.log('Delete user:', userId)}
    />
  );
};
```

## 最佳实践

### 1. 组件设计
- 遵循单一职责原则
- 保持组件的可复用性
- 使用 TypeScript 类型定义
- 添加必要的注释

### 2. 性能优化
- 使用 React.memo 优化渲染
- 合理使用 useMemo 和 useCallback
- 避免不必要的重渲染
- 使用虚拟列表处理长列表

### 3. 样式管理
- 使用 CSS-in-JS 方案
- 遵循 BEM 命名规范
- 支持主题定制
- 保持样式的一致性

### 4. 测试规范
- 编写单元测试
- 测试组件渲染
- 测试用户交互
- 测试边界情况

## 注意事项

### 1. 组件开发时需要考虑：
- 组件的可维护性
- 组件的可测试性
- 组件的可访问性
- 组件的性能

### 2. 组件使用时的注意事项：
- 正确传递 props
- 处理默认值
- 处理错误情况
- 遵循组件文档

## 更新日志

### 2024-03-04
- 初始化组件模块
- 添加文档
- 集成共享类型
- 更新组件规范 