import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpRequestManager } from '../manager';
import type { HttpRequestConfig } from '../types';
import type { AxiosError } from 'axios';
import { HttpErrorType } from '../error/types';

describe('HTTP 请求管理器', () => {
  let requestManager: HttpRequestManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    requestManager = new HttpRequestManager();
    requestManager.resetPerformanceStats();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('缓存管理', () => {
    it('应该生成正确的缓存键', () => {
      const config: HttpRequestConfig = {
        method: 'GET',
        url: '/test',
        params: { id: 1 }
      };

      const key = requestManager.generateCacheKey(config);
      expect(key).toBe('GET-/test-{"id":1}-undefined');
    });

    it('应该正确设置和获取缓存数据', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 1000;

      requestManager.setCacheData(key, data, ttl);
      const cachedData = requestManager.getCacheData(key);

      expect(cachedData).toEqual(data);
    });

    it('应该在 TTL 过期后清除缓存', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'test' };
      const ttl = 100;

      requestManager.setCacheData(key, data, ttl);
      
      await vi.advanceTimersByTimeAsync(ttl + 50);
      
      const cachedData = requestManager.getCacheData(key);
      expect(cachedData).toBeNull();
    });
  });

  describe('队列管理', () => {
    beforeEach(() => {
      requestManager.setMaxConcurrentRequests(2);
      vi.stubEnv('NODE_ENV', 'test');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('应该正确添加请求到队列', async () => {
      const config: HttpRequestConfig = {
        url: '/test',
        method: 'GET',
        queue: { enable: true, priority: 1 }
      };

      let resolved = false;
      await new Promise<void>(done => {
        requestManager.addToQueue(
          config,
          () => {
            resolved = true;
            done();
            return Promise.resolve('success');
          },
          () => done()
        );
      });

      expect(resolved).toBe(true);
    });

    it('应该按优先级处理队列请求', async () => {
      const processOrder: number[] = [];
      const configs = [
        { url: '/test1', queue: { enable: true, priority: 2 } },
        { url: '/test2', queue: { enable: true, priority: 1 } },
        { url: '/test3', queue: { enable: true, priority: 3 } }
      ] as HttpRequestConfig[];

      // 一次性添加所有请求到队列
      const promises = configs.map((config, index) => 
        new Promise<void>(resolve => {
          requestManager.addToQueue(
            config,
            () => {
              processOrder.push(index);
              resolve();
              return Promise.resolve('success');
            },
            () => resolve()
          );
        })
      );

      // 等待所有请求完成
      await Promise.all(promises);
      
      // 等待两个微任务周期，确保所有处理都完成
      await new Promise<void>(resolve => {
        queueMicrotask(() => {
          queueMicrotask(() => resolve());
        });
      });

      // 验证处理顺序：优先级 3, 2, 1
      expect(processOrder).toEqual([2, 0, 1]);
    });

    it('应该限制并发请求数', async () => {
      const maxConcurrent = 2;
      requestManager.setMaxConcurrentRequests(maxConcurrent);

      const activeRequests = new Set<number>();
      let maxConcurrentCount = 0;

      const configs = Array(5).fill(null).map((_, i) => ({
        url: `/test${i}`,
        queue: { enable: true, priority: 1 }
      })) as HttpRequestConfig[];

      // 一次性添加所有请求到队列
      const promises = configs.map((config, index) => 
        new Promise<void>(resolve => {
          requestManager.addToQueue(
            config,
            () => {
              activeRequests.add(index);
              maxConcurrentCount = Math.max(maxConcurrentCount, activeRequests.size);

              // 使用 Promise.resolve 确保异步执行
              return Promise.resolve().then(() => {
                activeRequests.delete(index);
                resolve();
              });
            },
            () => resolve()
          );
        })
      );

      // 等待所有请求完成
      await Promise.all(promises);

      // 等待两个微任务周期，确保所有处理都完成
      await new Promise<void>(resolve => {
        queueMicrotask(() => {
          queueMicrotask(() => resolve());
        });
      });

      // 验证最大并发数
      expect(maxConcurrentCount).toBeLessThanOrEqual(maxConcurrent);
      // 验证所有请求都已完成
      expect(activeRequests.size).toBe(0);
    });
  });

  describe('性能统计', () => {
    it('应该正确记录请求时间', async () => {
      const requestId = 'test1';
      requestManager.recordRequestStart(requestId);
      
      await vi.advanceTimersByTimeAsync(100);
      
      requestManager.recordRequestEnd(requestId);
      requestManager.recordRequestComplete(true);
      
      const stats = requestManager.getPerformanceStats();
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
    });

    it('应该正确计算成功率', () => {
      // 记录多个请求结果
      requestManager.recordRequestComplete(true);  // 成功
      requestManager.recordRequestComplete(true);  // 成功
      requestManager.recordRequestComplete(false); // 失败
      requestManager.recordRequestComplete(true);  // 成功

      const stats = requestManager.getPerformanceStats();
      expect(stats.successRate).toBe(0.75); // 3/4 = 0.75
      expect(stats.totalRequests).toBe(4);
      expect(stats.successfulRequests).toBe(3);
      expect(stats.failedRequests).toBe(1);
    });

    it('应该正确重置统计数据', () => {
      // 记录一些请求
      requestManager.recordRequestComplete(true);
      requestManager.recordRequestComplete(false);

      // 重置统计
      requestManager.resetPerformanceStats();

      const stats = requestManager.getPerformanceStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.successRate).toBe(0); // 重置后应该为 0
    });
  });

  describe('错误处理', () => {
    it('应该正确记录错误', () => {
      const error = {
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        status: 0
      };

      requestManager.recordError(error);
      const stats = requestManager.getErrorStats();
      expect(stats[HttpErrorType.NETWORK]).toBe(1);
    });

    it('应该正确重置错误统计', () => {
      const error = {
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        status: 0
      };

      requestManager.recordError(error);
      requestManager.resetErrorStats();
      
      const stats = requestManager.getErrorStats();
      expect(stats[HttpErrorType.NETWORK]).toBe(0);
    });
  });
}); 