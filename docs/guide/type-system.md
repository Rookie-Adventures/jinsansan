# 类型系统

## 概述

类型系统基于 TypeScript，提供了完整的类型定义和类型安全保证。类型定义按功能模块组织，避免重复定义。

## 核心类型

### 1. API 类型 (@/types/api.ts)

```typescript
import type { AxiosRequestConfig } from 'axios';
import type { ProgressInfo } from '@/utils/http/progress-monitor';

// API 响应类型
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页响应类型
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// HTTP 请求配置
interface HttpRequestConfig extends AxiosRequestConfig {
  cancelTokenId?: string;
  progress?: {
    onUploadProgress?: (info: ProgressInfo) => void;
    onDownloadProgress?: (info: ProgressInfo) => void;
  };
  errorHandler?: {
    handle: (error: any) => Promise<void>;
  };
}
```

### 2. 错误类型 (@/utils/http/error/types.ts)

```typescript
enum HttpErrorType {
  NETWORK = 'NETWORK',    // 网络错误
  TIMEOUT = 'TIMEOUT',    // 超时错误
  AUTH = 'AUTH',         // 认证错误
  SERVER = 'SERVER',     // 服务器错误
  CLIENT = 'CLIENT',     // 客户端错误
  CANCEL = 'CANCEL',     // 请求取消
  UNKNOWN = 'UNKNOWN',   // 未知错误
  REACT_ERROR = 'REACT_ERROR', // React组件错误
  VALIDATION = 'VALIDATION',   // 验证错误
  BUSINESS = 'BUSINESS'       // 业务错误
}

interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
  trace?: ErrorTrace;
  recoverable?: boolean;
  retryCount?: number;
}
```

### 3. 队列类型 (@/utils/http/types.ts)

```typescript
// 基础队列项类型
interface BaseQueueItem<T> {
  id: T;
  priority: number;
}

// HTTP请求队列项类型
interface HttpQueueItem<T = any> extends BaseQueueItem<T> {
  timestamp: number;
  config: HttpRequestConfig;
}
```

### 4. 工具类型 (@/types/utils.ts)

```typescript
// 深度可选类型
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// 可空类型
type Nullable<T> = T | null;

// 深度只读类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

## 类型组织

### 1. 目录结构
```
frontend/src/
├── types/
│   ├── api.ts          # API 相关类型
│   ├── auth.ts         # 认证相关类型
│   ├── utils.ts        # 工具类型
│   └── global.d.ts     # 全局类型声明
├── utils/
│   └── http/
│       ├── error/
│       │   └── types.ts # HTTP 错误类型
│       └── types.ts     # HTTP 工具类型
└── store/
    └── types.ts        # 状态管理类型
```

### 2. 类型导入导出规范

- 使用 type 导入导出类型
```typescript
import type { ApiResponse, HttpRequestConfig } from '@/types/api';
export type { HttpError, ApiResponse };
```

- 避免循环依赖
```typescript
// 好的做法
import type { User } from '@/types/auth';
import type { HttpError } from '@/utils/http/error/types';

// 避免的做法
import type { HttpError } from '@/utils/http/types';  // 不要从中间文件导入
```

## 最佳实践

### 1. 类型定义
- 使用接口定义对象类型
- 使用类型别名定义联合类型和工具类型
- 为复杂类型添加 JSDoc 注释

### 2. 类型安全
- 启用严格类型检查
- 避免使用 any 类型
- 实现必要的类型守卫

### 3. 类型组织
- 按功能模块组织类型定义
- 避免类型定义重复
- 保持类型定义的单一职责

### 4. 类型复用
- 优先使用类型组合而不是继承
- 利用工具类型进行类型转换
- 使用泛型增加类型灵活性 