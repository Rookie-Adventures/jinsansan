import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouterAnalytics } from '../../../infrastructure/monitoring/RouterAnalytics';
import { PerformanceMonitor } from '../../../infrastructure/monitoring/PerformanceMonitor';

describe('Router Analytics', () => {
  let routerAnalytics: RouterAnalytics;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    performanceMonitor = PerformanceMonitor.getInstance();
    routerAnalytics = RouterAnalytics.getInstance();
    routerAnalytics.clearAnalytics();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('路由跟踪', () => {
    it('应该记录路由变化', () => {
      const path = '/dashboard';
      const navigationType = 'push';

      routerAnalytics.trackRoute(path, navigationType);

      const stats = routerAnalytics.getRouteStats();
      expect(stats[path]).toBe(1);
    });

    it('应该记录路由持续时间', () => {
      const firstPath = '/home';
      const secondPath = '/dashboard';
      
      routerAnalytics.trackRoute(firstPath, 'push');
      vi.advanceTimersByTime(1000); // 模拟停留1秒
      routerAnalytics.trackRoute(secondPath, 'push');

      const duration = routerAnalytics.getAverageRouteDuration(firstPath);
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('应该正确处理返回操作', () => {
      routerAnalytics.trackRoute('/home', 'push');
      routerAnalytics.trackRoute('/dashboard', 'push');
      routerAnalytics.trackRoute('/home', 'pop');

      const stats = routerAnalytics.getRouteStats();
      expect(stats['/home']).toBe(2);
      expect(stats['/dashboard']).toBe(1);
    });
  });

  describe('数据上报', () => {
    it('应该上报路由分析数据', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;
      
      routerAnalytics.trackRoute('/home', 'push');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/route', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('/home')
      }));
    });

    it('应该处理上报失败的情况', async () => {
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      routerAnalytics.trackRoute('/home', 'push');
      await vi.runAllTimersAsync();

      expect(mockConsoleError).toHaveBeenCalled();
      const stats = routerAnalytics.getRouteStats();
      expect(stats['/home']).toBe(1);
    });
  });

  describe('性能指标', () => {
    it('应该记录路由切换的性能指标', () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      routerAnalytics.trackRoute('/dashboard', 'push');
      vi.advanceTimersByTime(500);
      routerAnalytics.trackRoute('/profile', 'push');

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_change_duration',
        expect.any(Number)
      );
    });

    it('应该记录首次加载时间', () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟 performance.timing
      Object.defineProperty(window.performance, 'timing', {
        value: {
          navigationStart: Date.now() - 1000,
          loadEventEnd: Date.now()
        },
        configurable: true
      });

      routerAnalytics.trackRoute('/', 'initial');

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'initial_route_load',
        expect.any(Number)
      );
    });
  });

  describe('路由分析统计', () => {
    it('应该统计路由访问频率', () => {
      routerAnalytics.trackRoute('/home', 'push');
      routerAnalytics.trackRoute('/dashboard', 'push');
      routerAnalytics.trackRoute('/home', 'push');
      
      const stats = routerAnalytics.getRouteStats();
      expect(stats['/home']).toBe(2);
      expect(stats['/dashboard']).toBe(1);
    });

    it('应该计算平均停留时间', () => {
      routerAnalytics.trackRoute('/home', 'push');
      vi.advanceTimersByTime(1000);
      routerAnalytics.trackRoute('/dashboard', 'push');
      vi.advanceTimersByTime(2000);
      routerAnalytics.trackRoute('/home', 'push');

      const avgDuration = routerAnalytics.getAverageRouteDuration('/dashboard');
      expect(avgDuration).toBe(2000);
    });
  });

  describe('路由切换动画性能', () => {
    it('应该记录路由切换动画的性能指标', () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟路由切换动画开始
      routerAnalytics.trackRouteTransitionStart('/home', '/dashboard');
      vi.advanceTimersByTime(300); // 模拟动画持续300ms
      routerAnalytics.trackRouteTransitionEnd();

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_transition_duration',
        expect.any(Number)
      );

      const duration = mockTrackCustomMetric.mock.calls[0][1];
      expect(duration).toBe(300);
    });

    it('应该记录路由切换动画帧率', () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟 requestAnimationFrame
      const mockRaf = vi.fn();
      global.requestAnimationFrame = mockRaf;
      
      // 模拟路由切换动画
      routerAnalytics.trackRouteTransitionStart('/home', '/dashboard');
      
      // 模拟60fps的动画帧
      for (let i = 0; i < 18; i++) { // 300ms at 60fps ≈ 18 frames
        mockRaf.mock.calls[i][0](performance.now() + (i * 16.67)); // 16.67ms per frame at 60fps
      }
      
      routerAnalytics.trackRouteTransitionEnd();

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_transition_fps',
        expect.any(Number)
      );

      const fps = mockTrackCustomMetric.mock.calls[1][1];
      expect(fps).toBeCloseTo(60, 0);
    });

    it('应该检测到动画性能问题', () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 模拟路由切换动画
      routerAnalytics.trackRouteTransitionStart('/home', '/dashboard');
      vi.advanceTimersByTime(500); // 模拟较长的动画时间
      routerAnalytics.trackRouteTransitionEnd();

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('路由切换动画性能问题')
      );
      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_transition_performance_issue',
        1
      );
    });
  });

  describe('路由预加载性能', () => {
    it('应该记录路由预加载时间', async () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟预加载开始
      routerAnalytics.trackPreloadStart('/dashboard');
      vi.advanceTimersByTime(100); // 模拟预加载耗时100ms
      await routerAnalytics.trackPreloadEnd('/dashboard');

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_duration',
        100
      );
    });

    it('应该记录预加载成功率', async () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟多次预加载
      for (let i = 0; i < 5; i++) {
        routerAnalytics.trackPreloadStart(`/route-${i}`);
        if (i < 4) {
          await routerAnalytics.trackPreloadEnd(`/route-${i}`);
        } else {
          await routerAnalytics.trackPreloadError(`/route-${i}`, new Error('预加载失败'));
        }
      }

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_success_rate',
        0.8 // 4成功/5总数 = 0.8
      );
    });

    it('应该记录预加载缓存命中率', async () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟预加载和缓存
      routerAnalytics.trackPreloadStart('/dashboard');
      await routerAnalytics.trackPreloadEnd('/dashboard');
      
      // 模拟从缓存加载
      routerAnalytics.trackPreloadStart('/dashboard');
      await routerAnalytics.trackPreloadEnd('/dashboard', true); // true表示从缓存加载

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_cache_hit_rate',
        0.5 // 1缓存命中/2总数 = 0.5
      );
    });

    it('应该记录预加载资源大小', async () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟资源大小统计
      routerAnalytics.trackPreloadStart('/dashboard');
      await routerAnalytics.trackPreloadEnd('/dashboard', false, {
        jsSize: 50000, // 50KB
        cssSize: 10000, // 10KB
        totalSize: 60000 // 60KB
      });

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_size',
        60000
      );
      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_js_size',
        50000
      );
      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_css_size',
        10000
      );
    });

    it('应该优化重复预加载请求', async () => {
      const mockTrackCustomMetric = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      // 模拟同时多次预加载请求
      const requests = [
        routerAnalytics.trackPreloadStart('/dashboard'),
        routerAnalytics.trackPreloadStart('/dashboard'),
        routerAnalytics.trackPreloadStart('/dashboard')
      ];

      // 应该只有一个实际的预加载请求
      const preloadCount = routerAnalytics.getActivePreloadCount('/dashboard');
      expect(preloadCount).toBe(1);

      // 完成预加载
      await routerAnalytics.trackPreloadEnd('/dashboard');
      
      // 所有请求都应该被解决
      await Promise.all(requests);

      expect(mockTrackCustomMetric).toHaveBeenCalledWith(
        'route_preload_deduplication_count',
        2 // 3个请求，去重2个
      );
    });
  });
}); 