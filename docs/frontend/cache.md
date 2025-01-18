# HTTP 请求缓存管理

## 概述

HTTP 请求缓存管理是前端应用中的一个重要组成部分，它通过缓存响应数据来减少不必要的网络请求，提高应用性能。我们使用 `HttpRequestManager` 类来实现这一功能。

## 主要功能

1. 缓存键生成
   - 基于请求方法、URL、参数和数据生成唯一的缓存键
   - 支持自定义缓存键

2. 缓存数据管理
   - 设置缓存数据和 TTL（Time To Live）
   - 获取缓存数据
   - 自动清理过期缓存
   - 手动清理缓存

3. 并发请求处理
   - 支持多个请求同时访问缓存
   - 保证缓存数据一致性

## 测试用例

### 1. 缓存键生成测试

```typescript
test('应该为不同的请求配置生成唯一的缓存键', () => {
  const config1 = {
    method: 'GET',
    url: '/api/test',
    params: { id: 1 },
    data: null
  };

  const config2 = {
    method: 'GET',
    url: '/api/test',
    params: { id: 2 },
    data: null
  };

  const key1 = manager.generateCacheKey(config1);
  const key2 = manager.generateCacheKey(config2);

  expect(key1).not.toBe(key2);
});
```

### 2. 缓存数据操作测试

```typescript
test('应该能够正确设置和获取缓存数据', () => {
  const key = 'test-key';
  const data = { id: 1, name: 'test' };
  const ttl = 1000; // 1秒

  manager.setCacheData(key, data, ttl);
  const cachedData = manager.getCacheData<typeof data>(key);

  expect(cachedData).toEqual(data);
});

test('过期的缓存数据应该被自动删除', async () => {
  const key = 'test-key';
  const data = { id: 1, name: 'test' };
  const ttl = 100; // 100毫秒

  manager.setCacheData(key, data, ttl);
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const cachedData = manager.getCacheData<typeof data>(key);
  expect(cachedData).toBeNull();
});
```

### 3. 并发测试

```typescript
test('多个请求同时访问缓存应该正常工作', async () => {
  const key = 'test-key';
  const data = { id: 1, name: 'test' };
  const ttl = 1000;

  const promises = Array(5).fill(null).map(async () => {
    manager.setCacheData(key, data, ttl);
    return manager.getCacheData<typeof data>(key);
  });

  const results = await Promise.all(promises);
  results.forEach((result) => {
    expect(result).toEqual(data);
  });
});
```

## 使用示例

```typescript
// 创建请求管理器实例
const manager = HttpRequestManager.getInstance();

// 配置请求
const config = {
  method: 'GET',
  url: '/api/data',
  cache: {
    enable: true,
    ttl: 5000, // 5秒缓存
    key: 'custom-cache-key' // 可选
  }
};

// 发送请求
const response = await manager.executeRequest(config);
```

## 注意事项

1. 缓存键生成
   - 确保缓存键包含足够的信息以区分不同请求
   - 避免缓存键过长

2. 缓存时间
   - 根据数据更新频率设置合适的 TTL
   - 对于频繁变化的数据，建议使用较短的 TTL

3. 内存管理
   - 定期清理过期缓存
   - 监控缓存大小，避免内存泄漏

4. 并发处理
   - 确保缓存操作是线程安全的
   - 使用 Map 数据结构保证原子性操作 