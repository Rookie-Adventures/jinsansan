import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PerformanceMonitor } from '../performance';

// Mock Logger
const mockError = vi.fn();
const mockLogger = {
  debug: vi.fn(),
  error: mockError,
};

vi.mock('@/infrastructure/logging/Logger', () => ({
  Logger: {
    getInstance: vi.fn(() => mockLogger),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPerformanceNow.mockReset();
    mockFetch.mockReset();
    mockError.mockReset();
    monitor = PerformanceMonitor.getInstance();
    monitor.resetMetrics();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    monitor.stopReporting();
  });

  describe('基础功能', () => {
    it('应该是单例模式', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('应该能记录和计算请求响应时间', () => {
      const requestId = 'test-request';
      mockPerformanceNow
        .mockReturnValueOnce(1000) // 开始时间
        .mockReturnValueOnce(1500); // 结束时间

      monitor.recordRequestStart(requestId);
      monitor.recordRequestEnd(requestId);

      const stats = monitor.getPerformanceStats();
      expect(stats.avgResponseTime).toBe(500);
    });

    it('应该能记录错误', () => {
      monitor.recordError('API_ERROR');
      monitor.recordError('API_ERROR');
      monitor.recordError('NETWORK_ERROR');

      const stats = monitor.getPerformanceStats();
      expect(stats.errorRates).toEqual({
        API_ERROR: 2,
        NETWORK_ERROR: 1,
      });
    });

    it('应该能记录资源使用情况', () => {
      monitor.recordResourceUsage('CPU', 80);
      monitor.recordResourceUsage('MEMORY', 60);

      const stats = monitor.getPerformanceStats();
      expect(stats.resourceUsage).toEqual({
        CPU: 80,
        MEMORY: 60,
      });
    });

    it('应该能记录自定义指标', () => {
      monitor.recordCustomMetric('pageLoad', 1200);
      monitor.recordCustomMetric('apiLatency', 300);

      const stats = monitor.getPerformanceStats();
      expect(stats.customMetrics).toEqual({
        pageLoad: 1200,
        apiLatency: 300,
      });
    });
  });

  describe('性能统计', () => {
    it('应该正确计算百分位数', () => {
      // 模拟100个响应时间
      for (let i = 0; i < 100; i++) {
        mockPerformanceNow
          .mockReturnValueOnce(1000)
          .mockReturnValueOnce(1000 + i * 10);
        monitor.recordRequestStart(`request-${i}`);
        monitor.recordRequestEnd(`request-${i}`);
      }

      const stats = monitor.getPerformanceStats();
      expect(stats.p95ResponseTime).toBe(950); // 95th percentile
      expect(stats.p99ResponseTime).toBe(990); // 99th percentile
    });

    it('应该在没有数据时返回默认值', () => {
      const stats = monitor.getPerformanceStats();
      expect(stats).toEqual({
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRates: {},
        resourceUsage: {},
        customMetrics: {},
      });
    });
  });

  describe('定时报告', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      mockFetch.mockReset();
      mockError.mockReset();
      monitor = PerformanceMonitor.getInstance();
      monitor.resetMetrics();
      monitor.setReporting(false);
    });

    afterEach(() => {
      vi.useRealTimers();
      const monitor = PerformanceMonitor.getInstance();
      monitor.setReporting(false);
    });

    it('应该定期发送性能报告', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      
      const monitor = PerformanceMonitor.getInstance();
      monitor.recordError('TEST_ERROR');
      monitor.recordResourceUsage('CPU', 70);
      
      // 启动报告功能
      monitor.setReporting(true);
      
      // 等待定时器触发
      await vi.runOnlyPendingTimersAsync();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });

    it('应该处理发送失败的情况', async () => {
      // 准备测试数据
      const error = new Error('Network error');
      mockFetch.mockRejectedValueOnce(error);
      
      // 直接调用发送方法
      await monitor.sendToMonitoringSystem(monitor.getPerformanceStats());
      
      // 验证错误被正确记录
      expect(mockError).toHaveBeenCalledWith(
        'Failed to send metrics to monitoring system:',
        { error }
      );
    });
  });

  describe('时间范围查询', () => {
    it('应该返回指定时间范围内的指标', () => {
      const now = Date.now();
      const startTime = now - 300000; // 5分钟前
      const endTime = now;

      // 记录一些测试数据
      monitor.recordError('TEST_ERROR');
      monitor.recordResourceUsage('CPU', 70);
      monitor.recordCustomMetric('customMetric', 100);

      const rangeMetrics = monitor.getMetricsInTimeRange(startTime, endTime);
      expect(rangeMetrics.errorRates.get('TEST_ERROR')).toBe(1);
      expect(rangeMetrics.resourceUsage.get('CPU')).toBe(70);
      expect(rangeMetrics.customMetrics.get('customMetric')).toBe(100);
    });
  });

  describe('趋势分析', () => {
    it('应该分析性能趋势', () => {
      // 模拟改善的响应时间趋势
      for (let i = 0; i < 20; i++) {
        mockPerformanceNow
          .mockReturnValueOnce(1000)
          .mockReturnValueOnce(1000 + (20 - i) * 10);
        monitor.recordRequestStart(`request-${i}`);
        monitor.recordRequestEnd(`request-${i}`);
      }

      const trends = monitor.analyzeTrends();
      expect(trends).toHaveProperty('responseTime.trend');
      expect(trends).toHaveProperty('errorRate.trend');
      expect(trends.responseTime.current).toBeGreaterThan(0);
    });

    it('应该在数据不足时返回稳定状态', () => {
      const trends = monitor.analyzeTrends();
      expect(trends.responseTime.trend).toBe('stable');
      expect(trends.errorRate.trend).toBe('stable');
    });
  });
}); 