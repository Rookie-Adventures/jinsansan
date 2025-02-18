import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { errorLogger } from '../../../utils/errorLogger';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock errorLogger
vi.mock('../../../utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance API
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    timing: {
      navigationStart: 0,
      domComplete: 1000,
      loadEventEnd: 1200,
      domInteractive: 800,
      domContentLoadedEventEnd: 900,
    },
  },
});

// Mock PerformanceObserver
class MockPerformanceObserver {
  private callback: (list: any) => void;

  constructor(callback: (list: any) => void) {
    this.callback = callback;
  }

  observe() {
    // Store the observer for testing
    mockObservers.push(this);
  }

  // Helper method for tests to trigger callbacks
  triggerCallback(entries: any[]) {
    this.callback({
      getEntries: () => entries,
    });
  }
}

const mockObservers: MockPerformanceObserver[] = [];
global.PerformanceObserver = MockPerformanceObserver as any;

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    // 重置所有的 mock
    vi.resetAllMocks();
    // 使用假的定时器
    vi.useFakeTimers();
    // 获取实例
    monitor = PerformanceMonitor.getInstance();
    mockPerformanceNow.mockReset();
    mockFetch.mockReset();
    mockObservers.length = 0;
    vi.clearAllMocks();
    monitor.clearMetrics();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('基础功能', () => {
    it('应该是单例模式', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('应该能正确启动和停止计时器', () => {
      const now = 1000;
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 1000);

      monitor.startTimer('test-timer');
      const duration = monitor.stopTimer('test-timer');

      expect(duration).toBe(1000);
    });

    it('停止不存在的计时器时应该抛出错误', () => {
      expect(() => monitor.stopTimer('non-existent')).toThrow(
        'No timer found with id: non-existent'
      );
    });

    it('应该能记录自定义指标', () => {
      const testMetric = {
        name: 'test-metric',
        value: 100,
        tags: { test: true },
      };

      monitor.recordMetric(testMetric.name, testMetric.value, testMetric.tags);
      const metrics = monitor['metrics'];

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'custom',
        data: {
          name: testMetric.name,
          value: testMetric.value,
          tags: testMetric.tags,
        },
      });
    });
  });

  describe('页面加载性能监控', () => {
    beforeEach(() => {
      // Mock performance.timing
      Object.defineProperty(window.performance, 'timing', {
        value: {
          navigationStart: 0,
          domComplete: 1000,
          loadEventEnd: 1200,
          domInteractive: 800,
          domContentLoadedEventEnd: 900,
        },
        configurable: true,
      });
    });

    it('应该能收集页面加载指标', () => {
      monitor.observePageLoadMetrics();
      const metrics = monitor['metrics'];

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'page_load',
        data: {
          domComplete: 1000,
          loadEventEnd: 1200,
          domInteractive: 800,
          domContentLoadedEventEnd: 900,
        },
      });
    });
  });

  describe('资源加载性能监控', () => {
    let mockObserver: any;
    let mockObserve: any;
    let mockDisconnect: any;

    beforeEach(() => {
      mockObserve = vi.fn();
      mockDisconnect = vi.fn();
      mockObserver = {
        observe: mockObserve,
        disconnect: mockDisconnect,
      };

      // Mock PerformanceObserver
      (global as any).PerformanceObserver = vi.fn(callback => {
        mockObserver.callback = callback;
        return mockObserver;
      });
    });

    it('应该能观察资源加载性能', () => {
      monitor.observeResourceTiming();

      expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['resource'] });

      // 模拟资源加载完成
      const mockEntry = {
        name: 'test.js',
        duration: 100,
        initiatorType: 'script',
      };

      mockObserver.callback({
        getEntries: () => [mockEntry],
      });

      const metrics = monitor['metrics'];
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'resource',
        data: {
          name: mockEntry.name,
          duration: mockEntry.duration,
          type: mockEntry.initiatorType,
        },
      });
    });
  });

  describe('长任务监控', () => {
    let mockObserver: any;

    beforeEach(() => {
      mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
      };

      (global as any).PerformanceObserver = vi.fn(callback => {
        mockObserver.callback = callback;
        return mockObserver;
      });
    });

    it('应该能观察长任务', () => {
      monitor.observeLongTasks();

      expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['longtask'] });

      // 模拟长任务
      const mockEntry = {
        duration: 100,
        startTime: 0,
      };

      mockObserver.callback({
        getEntries: () => [mockEntry],
      });

      const metrics = monitor['metrics'];
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'long_task',
        data: {
          duration: mockEntry.duration,
          startTime: mockEntry.startTime,
        },
      });
    });
  });

  describe('用户交互监控', () => {
    let mockObserver: any;

    beforeEach(() => {
      mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
      };

      (global as any).PerformanceObserver = vi.fn(callback => {
        mockObserver.callback = callback;
        return mockObserver;
      });
    });

    it('应该能观察用户交互', () => {
      monitor.observeUserInteractions();

      expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['event'] });

      // 模拟用户交互
      const mockEntry = {
        name: 'click',
        duration: 50,
        startTime: 0,
      };

      mockObserver.callback({
        getEntries: () => [mockEntry],
      });

      const metrics = monitor['metrics'];
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'interaction',
        data: {
          name: mockEntry.name,
          duration: mockEntry.duration,
          startTime: mockEntry.startTime,
        },
      });
    });
  });

  describe('API 调用监控', () => {
    it('应该能跟踪 API 调用', () => {
      monitor.trackApiCall('/api/test', 100, true);

      const metrics = monitor['metrics'];
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        type: 'api_call',
        data: {
          url: '/api/test',
          duration: 100,
          success: true,
        },
      });
    });
  });

  describe('指标验证', () => {
    it('应该验证指标名称', () => {
      monitor.recordMetric('', 100);
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid metric name',
        })
      );
    });

    it('应该验证指标值', () => {
      monitor.recordMetric('test', NaN);
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid metric value',
        })
      );
    });
  });

  describe('Metric Reporting', () => {
    it('应该成功发送指标', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      monitor.recordMetric('test', 100);

      await monitor.flush();

      expect(mockFetch).toHaveBeenCalledWith('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
      expect(monitor['metrics']).toHaveLength(0);
    });

    it('应该处理发送失败的情况', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      monitor.recordMetric('test', 100);

      await monitor.flush();

      expect(errorLogger.log).toHaveBeenCalled();
      expect(monitor['metrics']).toHaveLength(1);
    });

    it('应该处理服务器错误响应', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Server Error' });
      monitor.recordMetric('test', 100);

      await monitor.flush();

      expect(errorLogger.log).toHaveBeenCalled();
      expect(monitor['metrics']).toHaveLength(1);
    });
  });
});
