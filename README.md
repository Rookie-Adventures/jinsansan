# 项目初始化与工具链

## 工具链
- ✅ Vite 开发环境配置
- ✅ TypeScript 5.3.3 配置
  - 严格模式启用
  - 路径别名支持
  - 类型检查优化
- ✅ ESLint 9.16 规则设置
  - 新版 flat config 配置
  - TypeScript 集成
  - 自定义规则集
- ✅ 路径别名配置（@/）
- ✅ 开发服务器代理配置

## 路由系统
- ✅ React Router v6 配置
- ✅ 路由守卫实现（AuthGuard, GuestGuard）
- ✅ 懒加载路由
- ✅ 错误页面路由

## 状态管理
- ✅ Redux Toolkit 集成
  - 类型安全的状态管理
  - 持久化配置（redux-persist）
  - 序列化处理
- ✅ Redux Persist 持久化配置
  - 白名单机制
  - 版本控制
  - 迁移策略
- ✅ 类型安全的状态转换器
- ✅ Auth 状态切片（登录、登出、用户信息）
- ✅ App 状态切片（主题、加载状态）

## UI 框架基础
- ✅ Material-UI v5.16.9 集成
  - Material Design 3 实现
  - 主题系统配置
  - 响应式布局支持
- ✅ 主题配置（亮色/暗色模式）
- ✅ 基础布局组件
- ✅ 响应式布局支持

## HTTP 客户端
- ✅ Axios 配置
  - ✅ 请求/响应拦截器
  - ✅ 统一错误处理
  - ✅ 多层缓存系统
    - 内存缓存（Map）
    - Redux 持久化
    - HTTP 缓存
  - ✅ 请求队列
    - 优先级队列实现
    - 并发控制
    - 队列管理
  - ✅ 重试机制
    - 可配置重试次数
    - 延迟重试
    - 条件重试
  - ✅ 取消请求
    - 令牌管理
    - 批量取消
  - ✅ 进度监控
    - 上传进度
    - 下载进度
  - ✅ 性能优化
    - 防抖处理
    - 节流控制
    - 缓存策略

### 配置示例
```typescript
const httpConfig = {
  // 基础配置
  baseURL: '/api',
  timeout: 10000,
  
  // 缓存配置
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5分钟
  },
  
  // 重试配置
  retry: {
    times: 3,
    delay: 1000,
  },
  
  // 并发控制
  queue: {
    enable: true,
    concurrency: 3,
  },
  
  // 性能优化
  debounce: {
    wait: 1000,
    options: { leading: true },
  },
  throttle: {
    wait: 1000,
    options: { trailing: true },
  },
};
```

### 使用示例
```typescript
// 基本请求
const data = await http.get('/users');

// 带进度监控的上传
const result = await http.post('/upload', formData, {
  progress: {
    onUploadProgress: (info) => {
      console.log(`上传进度: ${info.progress}%`);
    }
  }
});

// 可取消的请求
const response = await http.get('/data', {
  cancelTokenId: 'request-1'
});

// 带缓存的请求
const cachedData = await http.get('/cached-data', {
  cache: {
    enable: true,
    ttl: 5000
  }
});
```

### 使用场景示例

#### 1. 文件上传场景
```typescript
// 单文件上传
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return http.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    progress: {
      onUploadProgress: (info) => {
        console.log(`上传进度: ${info.progress}%`);
      }
    }
  });
};

// 多文件上传
const uploadMultipleFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  return http.post('/upload/multiple', formData, {
    progress: {
      onUploadProgress: (info) => {
        console.log(`总体上传进度: ${info.progress}%`);
      }
    }
  });
};
```

#### 2. 并发请求控制
```typescript
// 使用请求队列控制并发
const fetchUserData = async (userIds: string[]) => {
  const requests = userIds.map(id => ({
    url: `/users/${id}`,
    priority: 1,
    queue: {
      enable: true,
      concurrency: 3
    }
  }));

  return Promise.all(
    requests.map(req => http.get(req.url, {
      queue: req.queue,
      priority: req.priority
    }))
  );
};

// 批量请求带优先级
const fetchMixedData = async () => {
  const requests = [
    { url: '/critical-data', priority: 2 },
    { url: '/normal-data', priority: 1 },
    { url: '/low-priority-data', priority: 0 }
  ];

  return Promise.all(
    requests.map(req => http.get(req.url, {
      queue: {
        enable: true,
        priority: req.priority
      }
    }))
  );
};
```

#### 3. 缓存策略应用
```typescript
// 基础缓存使用
const fetchCachedData = async () => {
  return http.get('/frequently-accessed-data', {
    cache: {
      enable: true,
      ttl: 5 * 60 * 1000, // 5分钟缓存
      key: 'custom-cache-key'
    }
  });
};

// 条件缓存
const fetchUserProfile = async (userId: string, forceRefresh = false) => {
  return http.get(`/users/${userId}/profile`, {
    cache: {
      enable: !forceRefresh,
      ttl: 30 * 60 * 1000, // 30分钟缓存
      key: `user-profile-${userId}`
    }
  });
};
```

#### 4. 错误重试机制
```typescript
// 自定义重试策略
const fetchWithRetry = async () => {
  return http.get('/unstable-api', {
    retry: {
      times: 3,
      delay: 1000,
      shouldRetry: (error: any) => {
        const status = error?.response?.status;
        return status >= 500 || status === 429; // 服务器错误或限流时重试
      }
    }
  });
};

// 带退避时间的重试
const fetchWithBackoff = async () => {
  let retryCount = 0;
  
  return http.get('/api-with-backoff', {
    retry: {
      times: 3,
      delay: (retryCount + 1) * 1000, // 递增延迟
      shouldRetry: (error: any) => {
        retryCount++;
        return error?.response?.status === 429;
      }
    }
  });
};
```

#### 5. 请求取消处理
```typescript
// 超时自动取消
const fetchWithTimeout = async () => {
  const cancelTokenId = 'request-' + Date.now();
  
  setTimeout(() => {
    http.cancelRequest(cancelTokenId);
  }, 5000); // 5秒后自动取消

  return http.get('/long-running-api', {
    cancelTokenId,
    timeout: 10000
  });
};

// 手动取消重复请求
const searchWithCancel = (() => {
  let currentRequest: string | null = null;
  
  return async (query: string) => {
    if (currentRequest) {
      http.cancelRequest(currentRequest);
    }
    
    currentRequest = `search-${Date.now()}`;
    
    try {
      return await http.get('/search', {
        params: { q: query },
        cancelTokenId: currentRequest
      });
    } finally {
      currentRequest = null;
    }
  };
})();
```

#### 6. 性能优化
```typescript
// 防抖请求
const debouncedSearch = async (query: string) => {
  return http.get('/search', {
    params: { q: query },
    debounce: {
      wait: 300,
      options: { leading: false, trailing: true }
    }
  });
};

// 节流请求
const throttledRefresh = async () => {
  return http.get('/refresh-data', {
    throttle: {
      wait: 1000,
      options: { leading: true, trailing: false }
    }
  });
};
```

#### 7. 组合使用场景
```typescript
// 完整特性组合示例
const complexRequest = async (data: any) => {
  return http.post('/complex-api', data, {
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
      shouldRetry: (error: any) => error?.response?.status >= 500
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

这些示例展示了 HTTP 客户端的主要功能和最佳实践。每个场景都包含了实际开发中常见的使用方式，可以根据具体需求进行调整和组合使用。

## 缓存系统
- ✅ 多层缓存架构
  - 内存缓存（Map）
  - HTTP 缓存
  - Redux 持久化
- ✅ 缓存策略
  - TTL 过期机制
  - 自定义缓存键
  - 缓存清理
- ✅ 缓存控制
  - 启用/禁用选项
  - 过期时间配置
  - 自定义缓存键

## 基础组件
- ✅ 布局组件（MainLayout）
- ✅ 导航栏组件（Navbar）
- ✅ 加载组件（Loading）
- ✅ 认证相关组件（LoginForm, AuthCard）

## 表单管理系统
- ✅ React Hook Form 集成
- ✅ Yup 表单验证
- ✅ 类型安全的表单 hooks
- ✅ 可复用的表单组件
- ✅ 通用验证规则
- ✅ 表单状态管理
- ✅ 异步提交处理
- ✅ 错误处理和展示

## 类型系统
- ✅ 基础类型定义
- ✅ API 响应类型
- ✅ 状态类型
- ✅ 组件 Props 类型
- ✅ 表单数据类型

## 错误处理系统
- ✅ 错误边界（ErrorBoundary）
- ✅ 错误通知（ErrorNotification）
- ✅ 错误上下文（ErrorContext）
- ✅ 错误日志（ErrorLogger）
- ✅ 类型安全的错误处理

## 开发规范
- ✅ ESLint 规则配置
  - 新版 flat config
  - TypeScript 规则集
  - 导入排序
- ✅ TypeScript 严格模式
- ✅ 代码格式化规则
- ✅ 文件命名规范

# 项目基础设施

## 搜索基础设施

### 搜索服务 (SearchService)
提供统一的搜索功能接口，支持基础搜索和高级搜索。

```typescript
interface SearchParams {
  keyword: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 搜索组件 (SearchBar)
- 支持防抖处理
- 支持自定义占位符
- 支持泛型类型
- 支持自定义防抖时间

```typescript
<SearchBar<UserType>
  onSearchResult={(users) => handleSearchResult(users)}
  placeholder="搜索用户..."
  debounceTime={500}
/>
```

## 文件处理基础设施

### 文件服务 (FileService)
提供统一的文件处理接口，支持 CSV 文件的上传、下载、解析和生成。

```typescript
interface UploadOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
  headers?: Record<string, string>;
  validateRow?: (row: any) => boolean;
}

interface DownloadParams {
  fileName: string;
  filters?: Record<string, any>;
  columns?: string[];
}
```

### 文件上传组件 (FileUploader)
- 支持进度监控
- 支持文件验证
- 支持错误处理
- 支持上传完成回调

```typescript
<FileUploader 
  onUploadComplete={(result) => handleUploadComplete(result)}
  onError={(error) => handleError(error)}
/>
```

### 特性
- [x] 基础搜索功能
- [x] 高级搜索功能
- [x] CSV 文件上传
- [x] CSV 文件下载
- [x] CSV 文件解析
- [x] CSV 文件生成
- [x] 进度监控
- [x] 错误处理
- [x] 类型安全
- [x] 防抖处理

### 待实现功能
- [ ] 后端 API 实现
- [ ] 搜索结果展示组件
- [ ] 文件列表组件
- [ ] 单元测试
- [ ] 文件分片上传
- [ ] 搜索缓存优化
- [ ] 更多文件格式支持

## 使用示例

### 搜索功能
```typescript
// 基础搜索
const searchService = new SearchServiceImpl();
const result = await searchService.search<UserType>({
  keyword: 'test',
  page: 1,
  pageSize: 10
});

// 高级搜索
const advancedResult = await searchService.advancedSearch<UserType>({
  keyword: 'test',
  filters: {
    status: 'active',
    role: 'admin'
  },
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 文件处理
```typescript
// 文件上传
const fileService = new FileServiceImpl();
const uploadResult = await fileService.uploadCSV(file, {
  onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
  validateRow: (row) => validateUserData(row)
});

// 文件下载
const csvBlob = await fileService.downloadCSV({
  fileName: 'users.csv',
  columns: ['id', 'name', 'email'],
  filters: { role: 'user' }
});

// CSV 解析
const users = await fileService.parseCSV<UserType>(csvContent);

// CSV 生成
const csvContent = await fileService.generateCSV<UserType>(userData);
```

## 注意事项
1. 文件上传大小限制：建议不超过 10MB
2. 搜索关键词长度：建议不超过 100 字符
3. 文件格式：目前仅支持 CSV 格式
4. 并发请求：默认最大并发数为 3
5. 缓存时间：搜索结果默认缓存 5 分钟

## 后续计划
1. 实现文件分片上传
2. 添加更多文件格式支持
3. 优化搜索性能
4. 添加更多自定义选项
5. 完善错误处理机制


## 待完成功能
- ❌ 国际化支持
- ❌ 单元测试
- ❌ E2E 测试
- ❌ CI/CD 配置
- ❌ 文档系统