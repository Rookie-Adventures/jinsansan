import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withDebounce, withThrottle, withCache, withQueue } from '../decorators';
import type { HttpRequestConfig } from '../types';
import { requestManager } from '../manager';

// Mock requestManager
vi.mock('../manager', () => ({
  requestManager: {
    generateCacheKey: vi.fn((config) => {
      const { method = 'GET', url = '', params, data } = config;
      return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
    }),
    getCacheData: vi.fn(),
    setCacheData: vi.fn(),
    addToQueue: vi.fn()
  }
}));

describe('HTTP 装饰器', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('防抖装饰器', () => {
    it('应该防抖请求', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const debouncedFn = withDebounce(mockFn, 300);
      const config: HttpRequestConfig = { url: '/test' };

      // 连续调用多次
      debouncedFn(config);
      debouncedFn(config);
      const promise = debouncedFn(config);

      // 等待防抖时间
      await vi.advanceTimersByTimeAsync(300);

      // 验证结果
      await promise;
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(config);
    });

    it('应该支持 leading 选项', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const debouncedFn = withDebounce(mockFn, 300, { leading: true });
      const config: HttpRequestConfig = { url: '/test' };

      // 第一次调用应该立即执行
      const promise1 = debouncedFn(config);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 后续调用应该被防抖
      debouncedFn(config);
      const promise2 = debouncedFn(config);

      // 等待防抖时间
      await vi.advanceTimersByTimeAsync(300);

      await Promise.all([promise1, promise2]);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('节流装饰器', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it('应该节流请求', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const throttledFn = withThrottle(mockFn, 100);
      const config: HttpRequestConfig = { url: '/test' };

      // 第一次调用应该立即执行
      throttledFn(config);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 在节流时间内的调用应该被延迟到结束时执行一次
      throttledFn(config);
      throttledFn(config);
      
      // 等待节流时间
      await vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // 第一次调用和最后一次trailing调用

      // 新的调用周期
      throttledFn(config);
      expect(mockFn).toHaveBeenCalledTimes(3); // 新周期的第一次调用
    });

    it('应该支持 trailing 选项', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const throttledFn = withThrottle(mockFn, 100, { trailing: false });
      const config: HttpRequestConfig = { url: '/test' };

      // 第一次调用应该立即执行
      throttledFn(config);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 在节流时间内的调用应该被忽略
      throttledFn(config);
      throttledFn(config);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 等待节流时间
      await vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // 由于禁用了trailing，不应该有额外调用

      // 新的调用周期
      throttledFn(config);
      expect(mockFn).toHaveBeenCalledTimes(2); // 新周期的第一次调用
    });
  });

  describe('缓存装饰器', () => {
    it('当缓存未启用时应该直接调用原函数', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const cachedFn = withCache(mockFn);
      const config: HttpRequestConfig = {
        url: '/test',
        cache: { enable: false, ttl: 0 }
      };

      await cachedFn(config);
      expect(mockFn).toHaveBeenCalledWith(config);
      expect(requestManager.getCacheData).not.toHaveBeenCalled();
    });

    it('当有缓存时应该返回缓存数据', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const cachedFn = withCache(mockFn);
      const config: HttpRequestConfig = {
        url: '/test',
        cache: { enable: true, ttl: 1000 }
      };

      // Mock 缓存数据
      vi.mocked(requestManager.getCacheData).mockReturnValue('cached');

      const result = await cachedFn(config);
      expect(result).toBe('cached');
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('当无缓存时应该调用原函数并缓存结果', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const cachedFn = withCache(mockFn);
      const config: HttpRequestConfig = {
        url: '/test',
        cache: { enable: true, ttl: 1000 }
      };

      // Mock 无缓存数据
      vi.mocked(requestManager.getCacheData).mockReturnValue(null);

      const result = await cachedFn(config);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith(config);
      expect(requestManager.setCacheData).toHaveBeenCalledWith(
        expect.any(String),
        'success',
        1000
      );
    });
  });

  describe('队列装饰器', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      // 重置 mock 实现
      vi.mocked(requestManager.addToQueue).mockImplementation(
        (config, resolve) => {
          queueMicrotask(() => resolve('success'));
        }
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('当队列未启用时应该直接调用原函数', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const queuedFn = withQueue(mockFn);
      const config: HttpRequestConfig = {
        url: '/test',
        queue: { enable: false, priority: 0 }
      };

      await queuedFn(config);
      expect(mockFn).toHaveBeenCalledWith(config);
      expect(requestManager.addToQueue).not.toHaveBeenCalled();
    });

    it('当队列启用时应该添加到队列', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const queuedFn = withQueue(mockFn);
      const config: HttpRequestConfig = {
        url: '/test',
        queue: { enable: true, priority: 0 }
      };

      const promise = queuedFn(config);
      expect(requestManager.addToQueue).toHaveBeenCalledTimes(1);
      expect(requestManager.addToQueue).toHaveBeenCalledWith(
        config,
        expect.any(Function),
        expect.any(Function)
      );
      await promise;
    });

    it('应该按优先级处理队列请求', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const queuedFn = withQueue(mockFn);
      
      const configs = [
        { url: '/test1', queue: { enable: true, priority: 2 } },
        { url: '/test2', queue: { enable: true, priority: 1 } },
        { url: '/test3', queue: { enable: true, priority: 3 } }
      ] as HttpRequestConfig[];

      // 按顺序添加请求到队列
      const promises = configs.map(config => queuedFn(config));
      
      // 等待所有请求完成
      await Promise.all(promises);
      
      // 验证调用顺序
      expect(requestManager.addToQueue).toHaveBeenCalledTimes(3);
      const calls = vi.mocked(requestManager.addToQueue).mock.calls;
      expect(calls[0][0]).toEqual(configs[0]);
      expect(calls[1][0]).toEqual(configs[1]);
      expect(calls[2][0]).toEqual(configs[2]);
    });
  });
}); 