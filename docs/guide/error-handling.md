# 错误处理系统

> 状态：✅ 已实施
> 
> 最后更新：2024年1月
>
> 更新记录：
> - 2024-01: 统一错误处理实现
> - 2024-01: 增强错误恢复策略
> - 2024-01: 优化错误工厂模式

## 1. 系统概述

错误处理系统提供了统一的错误捕获、处理和恢复机制，包括错误工厂、错误边界、错误日志、错误恢复等功能。

### 1.1 核心组件
- 错误工厂（HttpErrorFactory）
- 错误边界（ErrorBoundary）
- 错误日志（ErrorLogger）
- 错误恢复（ErrorRecoveryManager）
- 错误预防（ErrorPreventionManager）

### 1.2 主要特性
- **统一错误创建**：使用工厂模式创建标准化的错误对象
- **智能错误恢复**：基于错误类型的自动恢复策略
- **错误预防**：请求验证和缓存管理
- **性能监控**：错误处理性能追踪

## 2. 错误类型系统

### 2.1 HTTP错误类型
```typescript
export enum HttpErrorType {
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

export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
  trace?: ErrorTrace;
  recoverable?: boolean;
  retryCount?: number;
}

export interface ErrorTrace {
  id: string;
  timestamp: number;
  path: string;
  componentStack?: string;
  breadcrumbs: Array<{
    action: string;
    timestamp: number;
    data?: unknown;
  }>;
}
```

## 3. 核心组件实现

### 3.1 错误工厂
```typescript
class HttpErrorFactory {
  static create(error: unknown): HttpError {
    if (this.isAxiosError(error)) {
      return this.createFromAxiosError(error);
    }
    return this.createUnknownError(error);
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  private static createFromAxiosError(error: AxiosError): HttpError {
    const httpError = new Error(error.message) as HttpError;
    
    if (error.response) {
      const status = error.response.status;
      httpError.status = status;
      httpError.data = error.response.data;

      if (status === 401 || status === 403) {
        httpError.type = HttpErrorType.AUTH;
      } else if (status >= 500) {
        httpError.type = HttpErrorType.SERVER;
      } else if (status >= 400) {
        httpError.type = HttpErrorType.CLIENT;
      }
    } else if (error.code === 'ECONNABORTED') {
      httpError.type = HttpErrorType.TIMEOUT;
    } else if (error.message === 'Network Error') {
      httpError.type = HttpErrorType.NETWORK;
    } else if (error.message?.includes('canceled')) {
      httpError.type = HttpErrorType.CANCEL;
    } else {
      httpError.type = HttpErrorType.UNKNOWN;
    }

    return httpError;
  }
}
```

### 3.2 错误边界组件
```typescript
interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private logger: ErrorLogger;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.logger = ErrorLogger.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.logger.log({
      type: HttpErrorType.REACT_ERROR,
      message: error.message,
      stack: error.stack,
      data: errorInfo
    } as HttpError);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error} 
          onReset={this.handleReset} 
        />
      );
    }
    return this.props.children;
  }
}
```

### 3.3 错误恢复策略
```typescript
interface RecoveryStrategy {
  shouldAttemptRecovery: (error: HttpError) => boolean;
  recover: (error: HttpError) => Promise<void>;
  maxAttempts?: number;
}

const defaultStrategies: Record<HttpErrorType, RecoveryStrategy> = {
  [HttpErrorType.NETWORK]: {
    shouldAttemptRecovery: (error) => error.recoverable !== false,
    recover: async (error) => {
      if (error.retryCount && error.retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (error.retryCount || 1)));
        throw error; // 重新抛出错误以触发重试
      }
    },
    maxAttempts: 3
  },
  [HttpErrorType.AUTH]: {
    shouldAttemptRecovery: (error) => error.status === 401,
    recover: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // 实现 token 刷新逻辑
          return;
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    },
    maxAttempts: 1
  }
};
```

## 4. 使用示例

### 4.1 HTTP请求错误处理
```typescript
try {
  const response = await request(config);
  return response.data;
} catch (error) {
  const httpError = HttpErrorFactory.create(error);
  
  if (httpError.type === HttpErrorType.AUTH) {
    navigate('/login');
  } else if (httpError.type === HttpErrorType.NETWORK) {
    // 处理网络错误
  }
  
  throw httpError;
}
```

### 4.2 组件错误边界
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// 组件级错误边界
<ErrorBoundary fallback={<ComponentError />}>
  <UserList />
</ErrorBoundary>
```

## 5. 最佳实践

### 5.1 错误分类处理
- 根据错误类型采用不同处理策略
- 区分业务错误和技术错误
- 提供友好的错误提示

### 5.2 错误恢复机制
- 网络错误：自动重试，最多3次
- 超时错误：延长超时时间重试
- 认证错误：自动刷新 token
- 服务器错误：对非500错误进行重试

### 5.3 错误日志管理
- 记录详细的错误信息
- 包含错误上下文
- 实现日志分级
- 错误聚合分析

### 5.4 用户体验优化
- 提供友好的错误提示
- 引导用户进行错误恢复
- 避免技术性错误信息

### 5.5 开发调试支持
- 开发环境显示详细错误信息
- 生产环境隐藏敏感信息
- 提供错误追踪能力 