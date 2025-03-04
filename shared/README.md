# 共享模块 (Shared)

## 目录结构

```
shared/
├── types/           # 共享类型定义
│   ├── api/        # API 相关类型
│   ├── auth/       # 认证相关类型
│   ├── error/      # 错误相关类型
│   ├── http/       # HTTP 相关类型
│   ├── security/   # 安全相关类型
│   └── user/       # 用户相关类型
├── utils/           # 共享工具函数
│   ├── auth/       # 认证相关工具
│   ├── error/      # 错误处理工具
│   ├── http/       # HTTP 相关工具
│   ├── logger/     # 日志工具
│   ├── security/   # 安全相关工具
│   └── validation/ # 验证工具
└── constants/       # 共享常量
    ├── api.ts      # API 常量
    ├── auth.ts     # 认证常量
    └── error.ts    # 错误常量
```

## 共享规范

### 命名规范
- 类型文件使用 camelCase 命名（如 `userTypes.ts`）
- 工具文件使用 camelCase 命名（如 `authUtils.ts`）
- 常量文件使用 camelCase 命名（如 `apiConstants.ts`）
- 测试文件使用 `.test.ts` 后缀

### 类型定义
```typescript
// 类型定义模板
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details?: Record<string, any>;
}
```

### 工具函数
```typescript
// 工具函数模板
export const formatError = (error: Error): ErrorResponse => {
  return {
    code: 500,
    message: error.message,
    details: {
      stack: error.stack,
    },
  };
};
```

### 常量定义
```typescript
// 常量定义模板
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
  },
} as const;
```

## 使用示例

### 类型使用
```typescript
import { ApiResponse, User } from '@/shared/types/api';

export const fetchUser = async (): Promise<ApiResponse<User>> => {
  const response = await fetch('/api/user');
  return response.json();
};
```

### 工具使用
```typescript
import { formatError } from '@/shared/utils/error';

try {
  // 业务逻辑
} catch (error) {
  const formattedError = formatError(error as Error);
  // 错误处理
}
```

### 常量使用
```typescript
import { API_ENDPOINTS } from '@/shared/constants/api';

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.json();
};
```

## 最佳实践

1. **类型设计**
   - 保持类型简单
   - 使用 TypeScript 高级类型
   - 避免类型重复

2. **工具函数**
   - 保持函数纯函数
   - 添加类型注解
   - 编写单元测试

3. **常量管理**
   - 使用 const 断言
   - 避免魔法字符串
   - 集中管理常量

4. **开发规范**
   - 使用 TypeScript
   - 遵循代码规范
   - 保持代码简洁

## 注意事项

1. 共享代码开发时需要考虑：
   - 代码的可维护性
   - 代码的类型安全
   - 代码的测试覆盖
   - 代码的版本管理

2. 共享代码使用时的注意事项：
   - 正确处理类型
   - 处理错误情况
   - 遵循代码规范

## 更新日志

### v1.0.0
- 初始化共享模块
- 实现基础共享代码
- 添加共享代码文档 