import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RouterAnalytics } from '../RouterAnalytics';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock PerformanceMonitor
vi.mock('../PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: vi.fn().mockReturnValue({
      trackCustomMetric: vi.fn()
    })
  }
}));

// Mock fetch
global.fetch = vi.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16.67));

describe('RouterAnalytics', () => {
  let analytics: RouterAnalytics;
  let mockPerformanceMonitor: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPerformanceMonitor = PerformanceMonitor.getInstance();
    analytics = RouterAnalytics.getInstance();
    analytics.clearAnalytics();
    
    // Mock fetch success response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true
    });
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
      // Mock performance.timing
      Object.defineProperty(window.performance, 'timing', {
        value: {
          loadEventEnd: 1000,
          navigationStart: 0
        },
        configurable: true
      });

      analytics.trackRoute('/', 'initial');
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'initial_route_load',
        1000
      );
    });
  });

  describe('路由转场动画', () => {
    it('应该跟踪转场动画的开始和结束', () => {
      analytics.trackRouteTransitionStart('/home', '/about');
      vi.advanceTimersByTime(200);
      analytics.trackRouteTransitionEnd();

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_transition_duration',
        200
      );
    });

    it('应该检测性能问题', () => {
      analytics.trackRouteTransitionStart('/home', '/about');
      vi.advanceTimersByTime(400); // 超过300ms阈值
      analytics.trackRouteTransitionEnd();

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_transition_performance_issue',
        1
      );
    });

    it('应该计算帧率', () => {
      analytics.trackRouteTransitionStart('/home', '/about');
      
      // 模拟帧动画
      vi.advanceTimersByTime(167); // 约10帧的时间
      
      analytics.trackRouteTransitionEnd();

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_transition_fps',
        expect.any(Number)
      );
    });
  });

  describe('路由预加载', () => {
    it('应该跟踪预加载开始', async () => {
      const promise = analytics.trackPreloadStart('/dashboard');
      expect(promise).toBeInstanceOf(Promise);
      await promise; // 等待 Promise 完成
    });

    it('应该处理重复的预加载请求', async () => {
      const promise1 = analytics.trackPreloadStart('/dashboard');
      const promise2 = analytics.trackPreloadStart('/dashboard');

      expect(promise1).toBe(promise2);
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_deduplication_count',
        1
      );

      await promise1; // 等待 Promise 完成
    });

    it('应该跟踪预加载完成', async () => {
      const startPromise = analytics.trackPreloadStart('/dashboard');
      vi.advanceTimersByTime(100);
      
      // 确保 startPromise 已完成
      await startPromise;
      
      await analytics.trackPreloadEnd('/dashboard', true, {
        jsSize: 100000,
        cssSize: 50000,
        totalSize: 150000
      });

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_duration',
        100
      );
      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_js_size',
        100000
      );
    });

    it('应该跟踪预加载错误', async () => {
      const startPromise = analytics.trackPreloadStart('/dashboard');
      await startPromise;
      
      await analytics.trackPreloadError('/dashboard', new Error('Failed to preload'));

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_success_rate',
        0
      );
    });

    it('应该正确计算缓存命中率', async () => {
      // 第一次预加载 - 非缓存
      const startPromise1 = analytics.trackPreloadStart('/dashboard');
      await startPromise1;
      await analytics.trackPreloadEnd('/dashboard', false);

      // 第二次预加载 - 缓存
      const startPromise2 = analytics.trackPreloadStart('/about');
      await startPromise2;
      await analytics.trackPreloadEnd('/about', true);

      expect(mockPerformanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'route_preload_cache_hit_rate',
        0.5
      );
    });

    it('应该跟踪活动预加载数量', async () => {
      const startPromise = analytics.trackPreloadStart('/dashboard');
      await startPromise;
      
      expect(analytics.getActivePreloadCount('/dashboard')).toBe(1);

      await analytics.trackPreloadEnd('/dashboard');
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
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
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
        '/about': 1
      });
    });
  });
}); 