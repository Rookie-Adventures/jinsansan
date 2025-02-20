import { describe, it, expect, vi, beforeEach } from 'vitest';

import { requestManager } from '../requestManager';

describe('RequestManager', () => {
  beforeEach(() => {
    // 清理所有缓存
    requestManager.clearCache();
    // 重置所有定时器
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('缓存管理', () => {
    it('应该能正确设置和获取缓存数据', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      
      requestManager.setCacheData(key, data);
      const cached = requestManager.getCacheData<typeof data>(key);
      
      expect(cached).toEqual(data);
    });

    it('应该在过期后返回 null', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 1000; // 1秒
      
      requestManager.setCacheData(key, data, ttl);
      
      // 立即获取应该有数据
      expect(requestManager.getCacheData(key)).toEqual(data);
      
      // 前进 2 秒
      vi.advanceTimersByTime(2000);
      
      // 缓存应该已过期
      expect(requestManager.getCacheData(key)).toBeNull();
    });

    it('应该使用默认的 TTL (5分钟)', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      
      requestManager.setCacheData(key, data);
      
      // 前进 4 分钟，缓存应该还在
      vi.advanceTimersByTime(4 * 60 * 1000);
      expect(requestManager.getCacheData(key)).toEqual(data);
      
      // 前进到 6 分钟，缓存应该过期
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(requestManager.getCacheData(key)).toBeNull();
    });

    it('应该在缓存过期时自动删除缓存项', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 1000;
      
      requestManager.setCacheData(key, data, ttl);
      
      // 前进超过过期时间
      vi.advanceTimersByTime(2000);
      
      // 获取过期数据会触发删除
      requestManager.getCacheData(key);
      
      // 验证缓存项已被删除
      expect(requestManager.cache.has(key)).toBe(false);
    });
  });

  describe('缓存键生成', () => {
    it('应该为相同的配置生成相同的键', () => {
      const config1 = { url: '/api/test', method: 'GET', params: { id: 1 } };
      const config2 = { url: '/api/test', method: 'GET', params: { id: 1 } };
      
      const key1 = requestManager.generateCacheKey(config1);
      const key2 = requestManager.generateCacheKey(config2);
      
      expect(key1).toBe(key2);
    });

    it('应该为不同的配置生成不同的键', () => {
      const config1 = { url: '/api/test', method: 'GET', params: { id: 1 } };
      const config2 = { url: '/api/test', method: 'GET', params: { id: 2 } };
      
      const key1 = requestManager.generateCacheKey(config1);
      const key2 = requestManager.generateCacheKey(config2);
      
      expect(key1).not.toBe(key2);
    });

    it('应该正确处理嵌套对象', () => {
      const config = {
        url: '/api/test',
        method: 'POST',
        data: {
          user: {
            id: 1,
            profile: {
              name: 'test',
            },
          },
        },
      };
      
      const key = requestManager.generateCacheKey(config);
      expect(typeof key).toBe('string');
      expect(() => JSON.parse(key)).not.toThrow();
    });
  });

  describe('缓存清理', () => {
    beforeEach(() => {
      // 预填充一些缓存数据
      requestManager.setCacheData('key1', 'value1');
      requestManager.setCacheData('key2', 'value2');
      requestManager.setCacheData('key3', 'value3');
    });

    it('应该能清理指定的缓存项', () => {
      requestManager.clearCache('key1');
      
      expect(requestManager.getCacheData('key1')).toBeNull();
      expect(requestManager.getCacheData('key2')).toBe('value2');
      expect(requestManager.getCacheData('key3')).toBe('value3');
    });

    it('应该能清理所有缓存', () => {
      requestManager.clearCache();
      
      expect(requestManager.getCacheData('key1')).toBeNull();
      expect(requestManager.getCacheData('key2')).toBeNull();
      expect(requestManager.getCacheData('key3')).toBeNull();
      expect(requestManager.cache.size).toBe(0);
    });
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = requestManager;
      const instance2 = requestManager;
      
      expect(instance1).toBe(instance2);
    });

    it('应该在不同实例之间共享缓存', () => {
      const instance1 = requestManager;
      const instance2 = requestManager;
      
      instance1.setCacheData('test', 'value');
      expect(instance2.getCacheData('test')).toBe('value');
    });
  });
}); 