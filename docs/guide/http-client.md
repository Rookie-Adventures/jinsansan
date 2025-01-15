# HTTP 客户端

## 当前实现状态 (2024年1月)

### 已实现的技术栈 ✅
- Axios 1.6.2
- axios-retry 4.5.0

### 已实现的功能 ✅

#### 1. 基础配置
```typescript
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 2. 请求重试
```typescript
axiosRetry(request, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error: AxiosError) => {
    return (
      isNetworkError(error) || 
      (error.response?.status ? error.response.status >= 500 : false)
    );
  },
});
```

#### 3. 拦截器
```typescript
// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data.code !== 200) {
      return Promise.reject(new Error(data.message));
    }
    return Promise.resolve(response);
  }
);
```

#### 4. 类型安全
```typescript
type RequestMethod = <T>(config: RequestConfig) => Promise<ApiResponse<T>>;

interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: boolean;
  retryTimes?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}
```

#### 5. 请求缓存
```typescript
// 缓存配置
interface CacheConfig {
  enable: boolean;     // 是否启用缓存
  ttl: number;        // 缓存过期时间
  key?: string;       // 自定义缓存键
}

// 使用缓存
const response = await request({
  url: '/api/data',
  method: 'GET',
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5分钟
    key: 'custom-key'
  }
});
```

### 规划中的功能 📋

#### 1. 请求增强
- 请求队列管理
- 请求取消机制
- 请求优先级
- 并发请求控制

#### 2. 高级缓存功能
- 数据预加载
- 离线数据支持
- 缓存持久化
- 跨标签页缓存共享

#### 3. 监控与日志
- 请求性能监控
- 错误日志收集
- 请求统计分析
- 网络状态监测 