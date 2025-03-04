# 前端类型定义

## 目录结构

```
types/
├── README.md
└── index.ts        # 类型导出入口
```

## 类型规范

### 命名规则
- 使用 PascalCase 命名类型和接口
- 使用 camelCase 命名类型别名
- 使用 kebab-case 命名文件

### 类型分类

#### 1. 共享类型
- 从 `@shared/types` 导入
- 包括 API、认证、错误、HTTP、安全、用户等类型
- 这些类型在前端和后端之间共享

#### 2. 前端特有类型
- 组件 Props 类型
- 状态管理类型
- 路由类型
- 主题类型
- 工具函数类型

### 使用示例

```typescript
// 导入共享类型
import { User, ApiResponse } from '@shared/types';

// 导入前端特有类型
import { ThemeConfig } from './theme';
import { RouteConfig } from './router';

// 使用类型
interface UserProfileProps {
  user: User;
  theme: ThemeConfig;
  routes: RouteConfig[];
}
```

## 最佳实践

### 1. 类型复用
- 优先使用共享类型
- 避免重复定义已在共享模块中定义的类型
- 使用类型继承和组合来扩展共享类型

### 2. 类型安全
- 使用严格模式
- 避免使用 `any` 类型
- 为所有函数参数和返回值定义类型

### 3. 类型文档
- 为复杂类型添加 JSDoc 注释
- 说明类型的用途和约束
- 提供使用示例

### 4. 类型组织
- 按功能模块组织类型
- 使用 index.ts 统一导出
- 保持类型定义简洁清晰

## 更新日志

### 2024-03-04
- 初始化类型模块
- 添加文档
- 将共享类型迁移到 @shared/types
- 更新类型使用规范 