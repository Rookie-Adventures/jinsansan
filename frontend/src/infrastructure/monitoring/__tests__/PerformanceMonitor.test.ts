import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { errorLogger } from '../../../utils/errorLogger';
import { setupMockPerformanceObserver, validateMetrics, createMockEntry } from '@/test/utils/performanceTestUtils';
import { setupMockFetch, setupMockPerformanceAPI, setupMockErrorLogger } from '@/test/utils/mockSetup';

setupMockErrorLogger();
const mockFetch = setupMockFetch();
const mockPerformanceNow = setupMockPerformanceAPI();

// Mock errorLogger
vi.mock('../../../utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// Mock performance API
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

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let mockObserver: ReturnType<typeof setupMockPerformanceObserver>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    monitor = PerformanceMonitor.getInstance();
    mockPerformanceNow.mockReset();
    mockFetch.mockReset();
    monitor.clearMetrics();
    mockObserver = setupMockPerformanceObserver();
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
    it('应该能观察资源加载性能', () => {
      monitor.observeResourceTiming();

      const mockEntry = createMockEntry('resource', {
        name: 'test.js',
        duration: 100,
        initiatorType: 'script',
      });

      mockObserver.callback([mockEntry]);

      validateMetrics(monitor['metrics'], 'resource');
    });
  });

  describe('长任务监控', () => {
    it('应该能观察长任务', () => {
      monitor.observeLongTasks();

      const mockEntry = createMockEntry('longtask', {
        duration: 100,
        startTime: 0,
      });

      mockObserver.callback([mockEntry]);

      validateMetrics(monitor['metrics'], 'long_task');
    });
  });

  describe('用户交互监控', () => {
    it('应该能观察用户交互', () => {
      monitor.observeUserInteractions();

      const mockEntry = createMockEntry('event', {
        name: 'click',
        duration: 50,
        startTime: 0,
      });

      mockObserver.callback([mockEntry]);

      validateMetrics(monitor['metrics'], 'interaction');
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
