import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { errorLogger } from '../../../utils/errorLogger';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { MetricType } from '../types';

// 测试辅助函数和类型
interface MockEntry {
  name?: string;
  duration: number;
  startTime?: number;
  initiatorType?: string;
}

interface MockObserver {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  callback?: (list: { getEntries: () => MockEntry[] }) => void;
}

// 性能监控类型映射
const ENTRY_TYPE_TO_METRIC_TYPE = {
  'resource': MetricType.RESOURCE,
  'longtask': MetricType.LONG_TASK,
  'event': MetricType.INTERACTION,
} as const;

type EntryType = keyof typeof ENTRY_TYPE_TO_METRIC_TYPE;

const createMockObserver = (): MockObserver => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
});

const setupObserver = (_monitor: PerformanceMonitor, _entryType: string) => {
  const mockObserver = createMockObserver();
  (global as any).PerformanceObserver = vi.fn(callback => {
    mockObserver.callback = callback;
    return mockObserver;
  });
  return mockObserver;
};

const triggerObserverCallback = (observer: MockObserver, entries: MockEntry[]) => {
  observer.callback?.({
    getEntries: () => entries,
  });
};

const verifyMetrics = (
  monitor: PerformanceMonitor,
  expectedType: MetricType,
  expectedData: Record<string, any>
) => {
  const metrics = monitor['metrics'];
  expect(metrics).toHaveLength(1);
  expect(metrics[0]).toMatchObject({
    type: expectedType,
    data: expectedData,
  });
};

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

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    monitor = PerformanceMonitor.getInstance();
    mockPerformanceNow.mockReset();
    mockFetch.mockReset();
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
      verifyMetrics(monitor, MetricType.CUSTOM, {
        name: testMetric.name,
        value: testMetric.value,
        tags: testMetric.tags,
      });
    });
  });

  describe('页面加载性能监控', () => {
    beforeEach(() => {
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
      verifyMetrics(monitor, MetricType.PAGE_LOAD, {
        domComplete: 1000,
        loadEventEnd: 1200,
        domInteractive: 800,
        domContentLoadedEventEnd: 900,
      });
    });
  });

  describe.each([
    {
      name: '资源加载性能监控',
      method: 'observeResourceTiming' as const,
      entryType: 'resource' as EntryType,
      mockEntry: {
        name: 'test.js',
        duration: 100,
        initiatorType: 'script',
      },
      expectedData: {
        name: 'test.js',
        duration: 100,
        initiatorType: 'script',
      },
    },
    {
      name: '长任务监控',
      method: 'observeLongTasks' as const,
      entryType: 'longtask' as EntryType,
      mockEntry: {
        duration: 100,
        startTime: 0,
      },
      expectedData: {
        duration: 100,
        startTime: 0,
      },
    },
  ])('$name', ({ method, entryType, mockEntry, expectedData }) => {
    it(`应该能观察${entryType}`, () => {
      const mockObserver = setupObserver(monitor, entryType);
      
      const monitorMethod = monitor[method];
      monitorMethod.call(monitor);
      expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: [entryType] });

      triggerObserverCallback(mockObserver, [mockEntry]);
      verifyMetrics(monitor, ENTRY_TYPE_TO_METRIC_TYPE[entryType], expectedData);
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
        type: MetricType.INTERACTION,
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
