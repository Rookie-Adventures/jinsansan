# 错误处理

## 错误处理系统

### 核心组件
- 错误边界（ErrorBoundary）
- 错误通知（ErrorNotification）
- 错误上下文（ErrorContext）
- 错误日志（ErrorLogger）

### 错误类型
```typescript
interface AppError extends Error {
  code: string;
  context?: Record<string, any>;
  timestamp: number;
}

enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

## 使用示例

### 错误边界
```typescript
<ErrorBoundary
  fallback={<ErrorPage />}
  onError={(error) => logError(error)}
>
  <App />
</ErrorBoundary>
```

### 错误处理
```typescript
try {
  await api.request();
} catch (error) {
  errorHandler.handle(error, {
    context: { component: 'UserList' },
    notification: true
  });
}
```

## 最佳实践
1. 统一错误处理
2. 错误日志记录
3. 用户友好提示
4. 错误恢复机制 