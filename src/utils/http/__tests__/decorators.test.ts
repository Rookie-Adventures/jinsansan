import { describe, it, expect, vi, afterEach } from 'vitest';
import { withDebounce, withThrottle } from '../decorators';
import type { HttpRequestConfig } from '../types';

describe('HTTP 装饰器', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('防抖装饰器', () => {
    it('应该防抖请求', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const debouncedFn = withDebounce(mockFn, 1000);
      const config: HttpRequestConfig = { url: '/test' };

      // 连续调用多次
      const promise1 = debouncedFn(config);
      const promise2 = debouncedFn(config);
      const promise3 = debouncedFn(config);

      // 等待防抖时间
      await vi.advanceTimersByTimeAsync(1000);

      // 验证结果
      await Promise.all([promise1, promise2, promise3]);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(config);
    });

    it('应该支持 leading 选项', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const debouncedFn = withDebounce(mockFn, 1000, { leading: true });
      const config: HttpRequestConfig = { url: '/test' };

      // 第一次调用应该立即执行
      const promise1 = debouncedFn(config);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 后续调用应该被防抖
      const promise2 = debouncedFn(config);
      const promise3 = debouncedFn(config);

      // 等待防抖时间
      await vi.advanceTimersByTimeAsync(1000);

      await Promise.all([promise1, promise2, promise3]);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('节流装饰器', () => {
    it('应该节流请求', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const throttledFn = withThrottle(mockFn, 1000);
      const config: HttpRequestConfig = { url: '/test' };

      // 连续调用多次
      const promise1 = throttledFn(config);
      const promise2 = throttledFn(config);
      const promise3 = throttledFn(config);

      // 第一次调用应该立即执行
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 等待节流时间
      await vi.advanceTimersByTimeAsync(1000);

      // 最后一次调用应该被执行
      await Promise.all([promise1, promise2, promise3]);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('应该支持 trailing 选项', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn().mockResolvedValue('success');
      const throttledFn = withThrottle(mockFn, 1000, { trailing: false });
      const config: HttpRequestConfig = { url: '/test' };

      // 连续调用多次
      const promise1 = throttledFn(config);
      const promise2 = throttledFn(config);
      const promise3 = throttledFn(config);

      // 第一次调用应该立即执行
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 等待节流时间
      await vi.advanceTimersByTimeAsync(1000);

      // 由于禁用了 trailing，不应该执行最后一次调用
      await Promise.all([promise1, promise2, promise3]);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
}); 