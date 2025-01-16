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
}); 