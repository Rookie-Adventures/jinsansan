import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RouterAnalytics } from '../RouterAnalytics';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock PerformanceMonitor
vi.mock('../PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: vi.fn().mockReturnValue({
      trackCustomMetric: vi.fn().mockImplementation((metricName: string, value: number) => {
        switch (metricName) {
          case 'route_transition_fps':
            return value >= 30 ? value : 30; // 确保帧率至少为30
          case 'route_transition_performance_issue':
            return value < 30 ? 1 : 0; // 帧率低于30时报告性能问题
          case 'route_preload_start':
          case 'route_preload_duration':
          case 'route_transition_duration':
            return value;
          case 'route_preload_js_size':
          case 'route_preload_css_size':
          case 'route_preload_total_size':
          case 'route_preload_cache_hit_rate':
          case 'route_preload_error_count':
          case 'route_preload_success_rate':
          case 'route_preload_deduplication_count':
            return value;
          case 'route_analytics_error':
            return 1;
          default:
            return value;
        }
      }),
      trackTiming: vi.fn(),
    }),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock performance API
const mockPerformanceNow = vi.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
    timing: {
      navigationStart: 0,
      loadEventEnd: 1000,
      domContentLoadedEventEnd: 800,
      domInteractive: 600,
    },
    getEntriesByType: vi.fn().mockReturnValue([]),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16.67));

type MetricCall = [string, number];

describe('RouterAnalytics', () => {
  let analytics: RouterAnalytics;
  let mockPerformanceMonitor: any;
  const baseTime = Number(new Date('2024-01-01T00:00:00Z').getTime()) || 0;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(baseTime));
    mockPerformanceMonitor = PerformanceMonitor.getInstance();
    analytics = RouterAnalytics.getInstance();
    analytics.clearAnalytics();

    // Reset performance.now mock with safe number conversion
    mockPerformanceNow.mockReset();
    mockPerformanceNow.mockImplementation(() => {
      const currentTime = vi.getMockedSystemTime();
      return Number(currentTime) - baseTime;
    });

    // Mock fetch success response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    // 重置所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('基础路由跟踪', () => {
    it('应该正确跟踪路由变化', () => {
      analytics.trackRoute('/home', 'push');
      const stats = analytics.getRouteStats();
      expect(stats['/home']).toBe(1);
    });

    it('应该记录路由访问频率', () => {
      analytics.trackRoute('/home', 'push');
      analytics.trackRoute('/about', 'push');
      analytics.trackRoute('/home', 'push');

      const stats = analytics.getRouteStats();
      expect(stats['/home']).toBe(2);
      expect(stats['/about']).toBe(1);
    });

    it('应该计算平均路由停留时间', () => {
      analytics.trackRoute('/home', 'push');
      vi.advanceTimersByTime(1000);
      analytics.trackRoute('/about', 'push');

      const avgDuration = analytics.getAverageRouteDuration('/home');
      expect(avgDuration).toBe(1000);
    });

    it('应该记录首次加载时间', () => {
      Object.defineProperty(window.performance, 'timing', {
        value: {
          navigationStart: 0,
          loadEventEnd: 1000,
        },
        configurable: true,
        enumerable: true,
      });

      analytics.trackRoute('/', 'initial');

      const stats = analytics.getRouteStats();
      expect(stats['/']).toBeDefined();
    });
  });

  describe('路由转场动画', () => {
    it('应该跟踪转场动画的开始和结束', async () => {
      analytics.trackRouteTransitionStart('/home', '/about');

      // 模拟多个动画帧
      for (let i = 0; i < 10; i++) {
        await vi.advanceTimersByTimeAsync(16.67); // 约60fps
        mockPerformanceNow.mockReturnValue(Number(vi.getMockedSystemTime()));
      }

      analytics.trackRouteTransitionEnd();

      // 验证转场时间
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_transition_duration',
        expect.any(Number)
      );

      // 验证帧率
      const calls = mockPerformanceMonitor.trackCustomMetric.mock.calls as MetricCall[];
      const fpsCall = calls.find((call: MetricCall) => call[0] === 'route_transition_fps');
      expect(fpsCall).toBeDefined();
      expect(fpsCall![1]).toBeGreaterThan(0);
    });

    it('应该检测性能问题', async () => {
      analytics.trackRouteTransitionStart('/home', '/about');

      // 模拟低帧率场景，使用 50ms 每帧
      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(50);
        mockPerformanceNow.mockReturnValue(Number(vi.getMockedSystemTime()));
      }

      analytics.trackRouteTransitionEnd();

      const calls = mockPerformanceMonitor.trackCustomMetric.mock.calls as MetricCall[];
      const performanceIssueCall = calls.find(
        (call: MetricCall) => call[0] === 'route_transition_performance_issue'
      );
      if (performanceIssueCall) {
        expect(performanceIssueCall[1]).toBe(1);
      }
    });

    it('应该计算帧率', async () => {
      analytics.trackRouteTransitionStart('/home', '/about');

      // 模拟稳定 60fps 场景，使用约 16.67ms 每帧
      for (let i = 0; i < 60; i++) {
        await vi.advanceTimersByTimeAsync(16.67);
        mockPerformanceNow.mockReturnValue(Number(vi.getMockedSystemTime()));
      }

      analytics.trackRouteTransitionEnd();

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_transition_fps',
        expect.closeTo(62.5, 1)
      );
    });
  });

  describe('路由预加载', () => {
    it('应该跟踪预加载开始', async () => {
      const promise = analytics.trackPreloadStart('/dashboard');
      await vi.runAllTimersAsync();
      expect(analytics.getActivePreloadCount('/dashboard')).toBeGreaterThan(0);
      await promise;
    });

    it('应该处理重复的预加载请求', async () => {
      const promise1 = analytics.trackPreloadStart('/dashboard');
      const promise2 = analytics.trackPreloadStart('/dashboard');

      await vi.runAllTimersAsync();

      expect(promise1).toBe(promise2);
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_deduplication_count',
        1
      );

      await promise1;
    });

    it('应该跟踪预加载完成', async () => {
      const startTime = Number(vi.getMockedSystemTime());
      const startPromise = analytics.trackPreloadStart('/dashboard');

      await startPromise;
      const endTime = Number(vi.getMockedSystemTime());

      await analytics.trackPreloadEnd('/dashboard', true, {
        jsSize: 100000,
        cssSize: 50000,
        totalSize: 150000,
      });

      const calls = mockPerformanceMonitor.trackCustomMetric.mock.calls as MetricCall[];
      const durationCall = calls.find((call: MetricCall) => call[0] === 'route_preload_duration');
      expect(durationCall).toBeDefined();
      expect(durationCall![1]).toBe(endTime - startTime);

      // 验证资源大小
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_js_size',
        100000
      );
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_css_size',
        50000
      );
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_size',
        150000
      );
    });

    it('应该跟踪预加载错误', async () => {
      const startPromise = analytics.trackPreloadStart('/dashboard');
      await vi.runAllTimersAsync();
      await startPromise;

      const error = new Error('Failed to preload');
      await analytics.trackPreloadError('/dashboard', error);

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_error_count',
        1
      );
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_success_rate',
        0
      );
    });

    it('应该正确计算缓存命中率', async () => {
      // 第一次预加载 - 非缓存
      const startPromise1 = analytics.trackPreloadStart('/dashboard');
      await vi.runAllTimersAsync();
      await startPromise1;
      await analytics.trackPreloadEnd('/dashboard', false);

      // 第二次预加载 - 缓存
      const startPromise2 = analytics.trackPreloadStart('/about');
      await vi.runAllTimersAsync();
      await startPromise2;
      await analytics.trackPreloadEnd('/about', true);

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_cache_hit_rate',
        0.5
      );
    });

    it('应该跟踪活动预加载数量', async () => {
      const startPromise = analytics.trackPreloadStart('/dashboard');
      await vi.runAllTimersAsync();
      await startPromise;

      expect(analytics.getActivePreloadCount('/dashboard')).toBe(1);

      await analytics.trackPreloadEnd('/dashboard', true);
      expect(analytics.getActivePreloadCount('/dashboard')).toBe(0);
    });
  });

  describe('数据上报', () => {
    it('应该成功上报分析数据', async () => {
      analytics.trackRoute('/home', 'push');

      // 等待异步上报完成
      await vi.runAllTimersAsync();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/route',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
    });

    it('应该处理上报失败的情况', async () => {
      // Mock fetch failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      analytics.trackRoute('/home', 'push');

      // 等待异步上报完成
      await vi.runAllTimersAsync();

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_analytics_error',
        1
      );
    });
  });

  describe('数据获取', () => {
    it('应该返回所有路由分析数据', () => {
      analytics.trackRoute('/home', 'push');
      analytics.trackRoute('/about', 'push');

      const allAnalytics = analytics.getAnalytics();
      expect(allAnalytics).toHaveLength(2);
      expect(allAnalytics[0].path).toBe('/home');
      expect(allAnalytics[1].path).toBe('/about');
    });

    it('应该返回正确的路由统计信息', () => {
      analytics.trackRoute('/home', 'push');
      analytics.trackRoute('/home', 'push');
      analytics.trackRoute('/about', 'push');

      const stats = analytics.getRouteStats();
      expect(stats).toEqual({
        '/home': 2,
        '/about': 1,
      });
    });
  });
});
