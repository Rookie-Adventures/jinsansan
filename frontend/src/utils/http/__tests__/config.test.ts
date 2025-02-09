import { describe, it, expect } from 'vitest';
import { defaultConfig, type HttpConfig } from '../config';
import { AxiosError } from 'axios';

describe('HTTP 配置', () => {
  describe('默认配置', () => {
    it('应该有正确的基础配置', () => {
      expect(defaultConfig.baseURL).toBe('/api');
      expect(defaultConfig.timeout).toBe(10000);
    });

    it('应该有正确的缓存配置', () => {
      expect(defaultConfig.cache).toBeDefined();
      expect(defaultConfig.cache?.enable).toBe(true);
      expect(defaultConfig.cache?.ttl).toBe(5 * 60 * 1000); // 5分钟
      expect(defaultConfig.cache?.key).toBeUndefined();
    });

    it('应该有正确的重试配置', () => {
      expect(defaultConfig.retry).toBeDefined();
      expect(defaultConfig.retry?.times).toBe(3);
      expect(defaultConfig.retry?.delay).toBe(1000);
      expect(defaultConfig.retry?.shouldRetry).toBeDefined();
    });

    it('应该有正确的队列配置', () => {
      expect(defaultConfig.queue).toBeDefined();
      expect(defaultConfig.queue?.enable).toBe(true);
      expect(defaultConfig.queue?.concurrency).toBe(3);
      expect(defaultConfig.queue?.priority).toBe(0);
    });

    it('应该有正确的防抖配置', () => {
      expect(defaultConfig.debounce).toBeDefined();
      expect(defaultConfig.debounce?.wait).toBe(1000);
      expect(defaultConfig.debounce?.options?.leading).toBe(true);
    });

    it('应该有正确的节流配置', () => {
      expect(defaultConfig.throttle).toBeDefined();
      expect(defaultConfig.throttle?.wait).toBe(1000);
      expect(defaultConfig.throttle?.options?.trailing).toBe(true);
    });
  });

  describe('重试配置', () => {
    it('应该正确处理 500 错误', () => {
      const error = new AxiosError();
      error.response = { status: 500 } as any;
      expect(defaultConfig.retry?.shouldRetry?.(error)).toBe(true);
    });

    it('应该正确处理 429 错误', () => {
      const error = new AxiosError();
      error.response = { status: 429 } as any;
      expect(defaultConfig.retry?.shouldRetry?.(error)).toBe(true);
    });

    it('不应该重试 400 错误', () => {
      const error = new AxiosError();
      error.response = { status: 400 } as any;
      expect(defaultConfig.retry?.shouldRetry?.(error)).toBe(false);
    });

    it('不应该重试网络错误', () => {
      const error = new Error('Network Error');
      expect(defaultConfig.retry?.shouldRetry?.(error)).toBe(false);
    });
  });
}); 