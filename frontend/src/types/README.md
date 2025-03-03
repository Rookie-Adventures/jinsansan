# 类型定义使用文档

## User
用户相关的类型定义。

### 示例
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}
```

## Severity
严重性相关的类型定义。

### 示例
```typescript
type Severity = 'low' | 'medium' | 'high';
```

## Theme
主题相关的类型定义。

### 示例
```typescript
interface Theme {
  primaryColor: string;
  secondaryColor: string;
}
```

## Auth
认证相关的类型定义。

### 示例
```typescript
interface Auth {
  token: string;
  user: User;
}
```

## Error
错误相关的类型定义。

### 示例
```typescript
interface Error {
  code: number;
  message: string;
}
```

## Http
HTTP 相关的类型定义。

### 示例
```typescript
interface HttpResponse<T> {
  data: T;
  status: number;
}
``` 