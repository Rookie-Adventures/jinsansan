import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorLogger } from '../../../utils/errorLogger';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { RouterAnalytics } from '../RouterAnalytics';

// Mock errorLogger
vi.mock('../../../utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

// 添加类型定义
interface MetricData {
  type: string;
  timestamp: number;
  data: {
    name: string;
    value: number;
  };
}

describe('Data Reporting', () => {
  let performanceMonitor: PerformanceMonitor;
  let routerAnalytics: RouterAnalytics;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    performanceMonitor = PerformanceMonitor.getInstance();
    routerAnalytics = RouterAnalytics.getInstance();
    routerAnalytics.clearAnalytics();
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    vi.useRealTimers();
    performanceMonitor.clearMetrics();
  });

  describe('性能数据上报', () => {
    it('应该批量上报性能数据', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      // 收集各种性能指标
      performanceMonitor.trackCustomMetric('test-metric', 100);
      performanceMonitor.trackApiCall('/api/test', 200, true);
      performanceMonitor.trackCustomMetric('another-metric', 300);

      await performanceMonitor.flush();

      expect(mockFetch).toHaveBeenCalledWith('/api/metrics', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }));

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as MetricData[];
      expect(body).toHaveLength(3);
      expect(body.map((m) => m.type)).toContain('custom');
      expect(body.map((m) => m.type)).toContain('api_call');
    });

    it('应该在上报失败时保留数据', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      performanceMonitor.trackCustomMetric('test-metric', 100);
      await performanceMonitor.flush();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
    });

    it('应该在上报成功后清除数据', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      performanceMonitor.trackCustomMetric('test-metric', 100);
      await performanceMonitor.flush();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('数据格式验证', () => {
    it('应该验证性能数据格式', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const testMetric = {
        name: 'test-metric',
        value: 100
      };
      performanceMonitor.trackCustomMetric(testMetric.name, testMetric.value);
      await performanceMonitor.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as MetricData[];
      expect(body[0]).toMatchObject({
        type: 'custom',
        timestamp: expect.any(Number),
        data: testMetric
      });
    });

    it('应该验证路由数据格式', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      routerAnalytics.trackRoute('/home', 'push');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toMatchObject({
        path: '/home',
        timestamp: expect.any(Number),
        navigationType: 'push'
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      performanceMonitor.trackCustomMetric('test-metric', 100);
      await performanceMonitor.flush();

      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ level: 'error' })
      );
      expect(performanceMonitor.getMetrics()).toHaveLength(1);
    });

    it('应该处理服务器错误', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });
      global.fetch = mockFetch;

      performanceMonitor.trackCustomMetric('test-metric', 100);
      await performanceMonitor.flush();

      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ level: 'error' })
      );
      expect(performanceMonitor.getMetrics()).toHaveLength(1);
    });

    it('应该处理无效数据', async () => {
      // @ts-expect-error 故意传入无效数据以测试错误处理
      performanceMonitor.trackCustomMetric(null, 'invalid');
      
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ level: 'error' })
      );
    });
  });
}); 