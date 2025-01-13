# 类型系统

## 概述

类型系统基于 TypeScript，提供了完整的类型定义和类型安全保证，包括 API 响应类型、状态类型、组件 Props 类型等。

## 核心类型

### 1. 基础类型定义

```typescript
// 通用响应类型
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页响应类型
interface PaginatedResponse<T> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 通用错误类型
interface AppError extends Error {
  code: string;
  status?: number;
  data?: unknown;
}
```

### 2. 状态类型

```typescript
// 全局状态类型
interface RootState {
  auth: AuthState;
  app: AppState;
  user: UserState;
}

// 认证状态
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 应用状态
interface AppState {
  theme: 'light' | 'dark';
  language: string;
  loading: boolean;
  notifications: Notification[];
}
```

### 3. 组件 Props 类型

```typescript
// 组件属性类型
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// 表单字段属性
interface FieldProps<T = any> {
  name: string;
  label?: string;
  value?: T;
  onChange?: (value: T) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
}
```

## 工具类型

### 1. 类型转换

```typescript
// 将对象类型的所有属性变为可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 将对象类型的所有属性变为只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 从类型中排除某些键
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 从类型中选择某些键
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

### 2. 类型守卫

```typescript
// 类型守卫函数
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function isApiError(error: unknown): error is ApiError {
  return (
    isError(error) &&
    'code' in error &&
    typeof (error as ApiError).code === 'string'
  );
}

// 响应类型守卫
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.code === 200;
}
```

## 使用示例

### 1. API 类型定义

```typescript
// API 请求类型
interface LoginRequest {
  username: string;
  password: string;
}

// API 响应类型
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

// API 函数类型
type LoginApi = (data: LoginRequest) => Promise<ApiResponse<LoginResponse>>;
```

### 2. 组件类型应用

```typescript
// 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map((item) => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// 使用组件
<List<User>
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

## 最佳实践

1. **类型定义**
   - 使用接口定义对象类型
   - 使用类型别名定义联合类型
   - 合理使用泛型约束

2. **类型安全**
   - 启用严格类型检查
   - 避免使用 any 类型
   - 实现类型守卫

3. **类型组织**
   - 按模块组织类型定义
   - 导出公共类型
   - 维护类型文档

4. **泛型使用**
   - 合理使用泛型组件
   - 实现泛型约束
   - 提供默认类型

5. **工具类型**
   - 使用内置工具类型
   - 创建自定义工具类型
   - 复用类型逻辑 