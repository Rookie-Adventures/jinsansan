# 错误处理系统

## 概述

错误处理系统提供了统一的错误捕获、处理和展示机制，包括错误边界、错误通知、错误日志等功能。

## 核心组件

### 1. 错误类型定义

```typescript
export enum HttpErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  CANCEL = 'CANCEL',
  UNKNOWN = 'UNKNOWN',
  REACT_ERROR = 'REACT_ERROR'
}

export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
}
```

### 2. 错误边界组件

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### 3. 错误处理器

```typescript
class ErrorHandler {
  private static instance: ErrorHandler;
  private logger: ErrorLogger;

  private constructor() {
    this.logger = new ErrorLogger();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: HttpError, options?: {
    notification?: boolean;
    context?: Record<string, unknown>;
  }): void {
    // 记录错误日志
    this.logger.log(error, options?.context);

    // 显示错误通知
    if (options?.notification) {
      this.showErrorNotification(error);
    }

    // 根据错误类型处理
    switch (error.type) {
      case HttpErrorType.AUTH:
        this.handleAuthError(error);
        break;
      case HttpErrorType.NETWORK:
        this.handleNetworkError(error);
        break;
      // ... 其他错误类型处理
    }
  }
}
```

### 4. 错误日志服务

```typescript
class ErrorLogger {
  log(error: HttpError, context?: Record<string, unknown>): void {
    const logData = {
      type: error.type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    // 发送到日志服务器
    this.sendToLogServer(logData);
    
    // 开发环境打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error]:', logData);
    }
  }
}
```

## 使用示例

### 1. 错误边界使用

```typescript
// App.tsx
<ErrorBoundary
  fallback={<ErrorPage />}
  onError={(error) => errorHandler.handle(error)}
>
  <App />
</ErrorBoundary>

// 组件级错误边界
<ErrorBoundary
  fallback={<ComponentError />}
  onError={(error) => {
    errorHandler.handle(error, {
      notification: true,
      context: { component: 'UserList' }
    });
  }}
>
  <UserList />
</ErrorBoundary>
```

### 2. API 错误处理

```typescript
try {
  const response = await api.request();
} catch (error) {
  errorHandler.handle(error as HttpError, {
    notification: true,
    context: {
      url: error.config?.url,
      method: error.config?.method
    }
  });
}
```

### 3. 自定义错误处理

```typescript
class CustomErrorHandler extends ErrorHandler {
  protected handleAuthError(error: HttpError): void {
    // 处理认证错误
    if (error.status === 401) {
      store.dispatch(logout());
      router.push('/login');
    }
  }

  protected handleNetworkError(error: HttpError): void {
    // 处理网络错误
    notification.error({
      message: '网络错误',
      description: '请检查网络连接后重试'
    });
  }
}
```

## 最佳实践

1. **错误分类处理**
   - 根据错误类型采用不同处理策略
   - 区分业务错误和技术错误
   - 提供友好的错误提示

2. **错误恢复机制**
   - 实现自动重试机制
   - 提供手动重试选项
   - 保存未完成的操作

3. **错误日志管理**
   - 记录详细的错误信息
   - 包含错误上下文
   - 实现日志分级

4. **用户体验优化**
   - 提供友好的错误提示
   - 引导用户进行错误恢复
   - 避免技术性错误信息

5. **开发调试支持**
   - 开发环境显示详细错误信息
   - 生产环境隐藏敏感信息
   - 提供错误追踪能力 