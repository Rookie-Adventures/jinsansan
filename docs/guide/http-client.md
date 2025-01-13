# HTTP 客户端

## 概述

HTTP 客户端是一个基于 Axios 的强大封装，提供了丰富的功能特性，包括请求/响应拦截、缓存系统、请求队列、重试机制等。

## 核心功能

### 1. 基础配置

```typescript
const httpConfig = {
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### 2. 缓存系统

支持多层缓存架构：

- 内存缓存（Map）
- HTTP 缓存
- 自定义缓存键
- TTL 过期机制

```typescript
const cachedData = await http.get('/api/data', {
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5分钟缓存
    key: 'custom-cache-key'
  }
});
```

### 3. 请求队列

支持请求优先级和并发控制：

```typescript
const result = await http.get('/api/data', {
  queue: {
    enable: true,
    concurrency: 3,
    priority: 1
  }
});
```

### 4. 重试机制

自动重试失败的请求：

```typescript
const data = await http.get('/api/unstable', {
  retry: {
    times: 3,
    delay: 1000,
    shouldRetry: (error) => {
      const status = error?.response?.status;
      return status >= 500 || status === 429;
    }
  }
});
```

### 5. 请求取消

支持取消单个或所有请求：

```typescript
// 取消单个请求
const response = await http.get('/api/data', {
  cancelTokenId: 'request-1'
});

// 取消请求
http.cancelRequest('request-1');

// 取消所有请求
http.cancelAllRequests();
```

### 6. 进度监控

支持上传和下载进度监控：

```typescript
const result = await http.post('/api/upload', formData, {
  progress: {
    onUploadProgress: (info) => {
      console.log(`上传进度: ${info.progress}%`);
    },
    onDownloadProgress: (info) => {
      console.log(`下载进度: ${info.progress}%`);
    }
  }
});
```

### 7. 性能优化

包含防抖和节流功能：

```typescript
const response = await http.get('/api/data', {
  debounce: {
    wait: 1000,
    options: { leading: true }
  },
  // 或使用节流
  throttle: {
    wait: 1000,
    options: { trailing: true }
  }
});
```

## 高级用法

### 组合使用示例

```typescript
const complexRequest = async (data) => {
  return http.post('/api/complex', data, {
    // 缓存配置
    cache: {
      enable: true,
      ttl: 5 * 60 * 1000,
      key: `complex-${JSON.stringify(data)}`
    },
    
    // 重试配置
    retry: {
      times: 3,
      delay: 1000,
      shouldRetry: (error) => error?.response?.status >= 500
    },
    
    // 队列配置
    queue: {
      enable: true,
      priority: 1
    },
    
    // 进度监控
    progress: {
      onUploadProgress: (info) => console.log(`上传进度: ${info.progress}%`),
      onDownloadProgress: (info) => console.log(`下载进度: ${info.progress}%`)
    },
    
    // 性能优化
    debounce: {
      wait: 500,
      options: { leading: true }
    }
  });
};
```

### React Hooks 集成

使用 `useRequest` hook 进行数据请求：

```typescript
const { data, loading, error, execute } = useRequest('/api/data', {
  cache: {
    enable: true,
    ttl: 5000
  },
  queue: {
    enable: true,
    priority: 1
  }
});
```

## 错误处理

HTTP 客户端提供了统一的错误处理机制：

```typescript
try {
  const data = await http.get('/api/data');
} catch (error) {
  if (error.isHttpError) {
    console.error(`HTTP Error: ${error.code} - ${error.message}`);
  }
}
```

## 类型定义

完整的 TypeScript 类型支持：

```typescript
interface HttpRequestConfig extends AxiosRequestConfig {
  cache?: {
    enable: boolean;
    ttl: number;
    key?: string;
  };
  retry?: {
    times: number;
    delay: number;
    shouldRetry?: (error: any) => boolean;
  };
  queue?: {
    enable: boolean;
    priority: number;
  };
  progress?: {
    onUploadProgress?: (info: ProgressInfo) => void;
    onDownloadProgress?: (info: ProgressInfo) => void;
  };
}
```

## 最佳实践

1. **合理使用缓存**
   - 对于频繁访问但不常变化的数据启用缓存
   - 为缓存设置合适的 TTL
   - 使用自定义缓存键避免冲突

2. **请求优先级**
   - 为关键请求设置更高的优先级
   - 合理控制并发数量
   - 避免队列堆积

3. **错误处理**
   - 实现统一的错误处理逻辑
   - 针对特定错误码进行重试
   - 提供友好的错误提示

4. **性能优化**
   - 对频繁触发的请求使用防抖/节流
   - 及时取消不需要的请求
   - 监控请求性能指标

5. **类型安全**
   - 使用 TypeScript 类型定义
   - 为 API 响应定义接口
   - 利用泛型约束数据类型 