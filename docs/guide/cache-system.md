# 缓存系统

## 概述

缓存系统采用多层架构设计，提供了灵活的缓存策略和管理机制，可以有效提升应用性能和用户体验。

## 缓存层级

### 1. 内存缓存（Map）

使用 Map 数据结构实现的内存缓存，适用于频繁访问的数据：

```typescript
const cache = new Map<string, CacheData>();

interface CacheData<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}
```

### 2. HTTP 缓存

基于 HTTP 协议的缓存机制，支持多种缓存策略：

```typescript
const httpClient = new HttpClient({
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5分钟
    strategy: 'stale-while-revalidate'
  }
});
```

### 3. Redux 持久化

使用 redux-persist 实现的状态持久化：

```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings']
};
```

## 缓存策略

### 1. TTL 过期机制

```typescript
const setCacheData = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};
```

### 2. 自定义缓存键

```typescript
const generateCacheKey = (config: Record<string, unknown>): string => {
  return JSON.stringify({
    url: config.url,
    method: config.method,
    params: config.params,
    data: config.data
  });
};
```

### 3. 缓存清理

```typescript
const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
```

## React Hooks 集成

### useCache Hook

```typescript
export const useCache = () => {
  const getCacheData = useCallback(<T>(key: string): T | null => {
    return requestManager.getCacheData<T>(key);
  }, []);

  const setCacheData = useCallback(<T>(
    key: string, 
    data: T, 
    ttl: number = 5 * 60 * 1000
  ): void => {
    requestManager.setCacheData(key, data, ttl);
  }, []);

  const generateCacheKey = useCallback(
    (config: Record<string, unknown>): string => {
      return requestManager.generateCacheKey(config);
    }, 
  []);

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      requestManager.cache.delete(key);
    } else {
      requestManager.cache.clear();
    }
  }, []);

  return {
    getCacheData,
    setCacheData,
    generateCacheKey,
    clearCache,
  };
};
```

## 使用示例

### 1. 基本缓存操作

```typescript
const { getCacheData, setCacheData } = useCache();

// 设置缓存
setCacheData('user-1', userData, 5 * 60 * 1000);

// 获取缓存
const cachedUser = getCacheData('user-1');
```

### 2. HTTP 请求缓存

```typescript
const data = await http.get('/api/data', {
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000,
    key: 'custom-cache-key'
  }
});
```

### 3. 条件缓存

```typescript
const fetchUserProfile = async (userId: string, forceRefresh = false) => {
  return http.get(`/users/${userId}/profile`, {
    cache: {
      enable: !forceRefresh,
      ttl: 30 * 60 * 1000,
      key: `user-profile-${userId}`
    }
  });
};
```

## 最佳实践

1. **缓存策略选择**
   - 频繁访问的数据使用内存缓存
   - 较大数据集使用 HTTP 缓存
   - 需要持久化的状态使用 Redux 持久化

2. **缓存时间设置**
   - 根据数据更新频率设置合适的 TTL
   - 考虑内存占用设置最大缓存条目数
   - 及时清理过期缓存

3. **缓存键管理**
   - 使用规范的键命名约定
   - 避免键名冲突
   - 合理使用前缀分类

4. **性能优化**
   - 预加载关键数据
   - 实现缓存预热机制
   - 监控缓存命中率

5. **安全考虑**
   - 不缓存敏感信息
   - 实现缓存加密机制
   - 控制缓存访问权限 