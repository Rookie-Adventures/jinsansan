# 缓存系统

## 多层缓存架构

### 缓存层级
- 内存缓存（Map）
- HTTP 缓存
- Redux 持久化

### 缓存策略
- TTL 过期机制
- 自定义缓存键
- 缓存清理

## 使用示例

### 内存缓存
```typescript
const cache = new MemoryCache<string>({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100
});

// 设置缓存
await cache.set('key', 'value');

// 获取缓存
const value = await cache.get('key');
```

### HTTP 缓存
```typescript
const httpClient = new HttpClient({
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000,
    strategy: 'stale-while-revalidate'
  }
});
```

### Redux 持久化
```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings']
};
```

## 最佳实践
1. 合理设置 TTL
2. 定期清理缓存
3. 缓存预热
4. 缓存同步 