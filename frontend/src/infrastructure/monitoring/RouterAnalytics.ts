import { PerformanceMonitor } from './PerformanceMonitor';

export interface RouteAnalytics {
  path: string;
  timestamp: number;
  navigationType: 'push' | 'pop' | 'replace' | 'initial';
  previousPath?: string;
  duration?: number;
}

export class RouterAnalytics {
  private static instance: RouterAnalytics;
  private analytics: RouteAnalytics[] = [];
  private lastPath?: string;
  private lastTimestamp?: number;
  private performanceMonitor: PerformanceMonitor;
  private routeStats: Record<string, number> = {};
  private routeDurations: Record<string, number[]> = {};

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  public static getInstance(): RouterAnalytics {
    if (!RouterAnalytics.instance) {
      RouterAnalytics.instance = new RouterAnalytics();
    }
    return RouterAnalytics.instance;
  }

  public trackRoute(path: string, navigationType: RouteAnalytics['navigationType']): void {
    const timestamp = Date.now();
    const duration = this.lastTimestamp ? timestamp - this.lastTimestamp : undefined;

    // 记录路由访问频率
    this.routeStats[path] = (this.routeStats[path] || 0) + 1;

    // 记录路由停留时间
    if (this.lastPath && duration) {
      if (!this.routeDurations[this.lastPath]) {
        this.routeDurations[this.lastPath] = [];
      }
      this.routeDurations[this.lastPath].push(duration);
    }

    const analytics: RouteAnalytics = {
      path,
      timestamp,
      navigationType,
      previousPath: this.lastPath,
      duration
    };

    this.analytics.push(analytics);
    this.reportAnalytics(analytics);

    // 记录路由切换性能指标
    if (duration) {
      this.performanceMonitor.trackCustomMetric('route_change_duration', duration);
    }

    // 记录首次加载时间
    if (navigationType === 'initial') {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.performanceMonitor.trackCustomMetric('initial_route_load', loadTime);
    }

    this.lastPath = path;
    this.lastTimestamp = timestamp;
  }

  public getRouteStats(): Record<string, number> {
    return { ...this.routeStats };
  }

  public getAverageRouteDuration(path: string): number {
    const durations = this.routeDurations[path];
    if (!durations || durations.length === 0) return 0;

    const sum = durations.reduce((acc, curr) => acc + curr, 0);
    return sum / durations.length;
  }

  private async reportAnalytics(analytics: RouteAnalytics): Promise<void> {
    try {
      const response = await fetch('/api/analytics/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analytics)
      });

      if (!response.ok) {
        throw new Error(`Failed to report analytics: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to report route analytics:', error);
    }
  }

  // 用于测试的方法
  public clearAnalytics(): void {
    this.analytics = [];
    this.routeStats = {};
    this.routeDurations = {};
    this.lastPath = undefined;
    this.lastTimestamp = undefined;
  }
} 