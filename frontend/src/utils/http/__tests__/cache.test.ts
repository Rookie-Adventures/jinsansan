import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpRequestManager } from '../manager';

describe('HttpRequestManager Cache Tests', () => {
  let manager: HttpRequestManager;

  beforeEach(() => {
    manager = HttpRequestManager.getInstance();
    manager.cache.clear(); // 清空缓存
  });

  describe('缓存键生成', () => {
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
  });

  describe('缓存数据操作', () => {
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
      
      // 使用真实的定时器来等待缓存过期
      vi.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 150));
      vi.useFakeTimers();
      
      const cachedData = manager.getCacheData<typeof data>(key);
      expect(cachedData).toBeNull();
    });

    test('删除缓存数据后应该返回 null', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 1000;

      manager.setCacheData(key, data, ttl);
      manager.cache.delete(key);

      const cachedData = manager.getCacheData<typeof data>(key);
      expect(cachedData).toBeNull();
    });
  });

  describe('缓存并发测试', () => {
    test('多个请求同时访问缓存应该正常工作', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 1000;

      // 模拟多个并发请求
      const promises = Array(5).fill(null).map(async () => {
        manager.setCacheData(key, data, ttl);
        return manager.getCacheData<typeof data>(key);
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        expect(result).toEqual(data);
      });
    });
  });

  describe('缓存清理测试', () => {
    test('应该能够正确清理所有缓存数据', () => {
      // 添加多个缓存数据
      const items = [
        { key: 'key1', data: { id: 1 }, ttl: 1000 },
        { key: 'key2', data: { id: 2 }, ttl: 1000 },
        { key: 'key3', data: { id: 3 }, ttl: 1000 }
      ];

      items.forEach(item => {
        manager.setCacheData(item.key, item.data, item.ttl);
      });

      expect(manager.cache.size).toBe(3);

      manager.cache.clear();
      expect(manager.cache.size).toBe(0);
    });
  });
}); 