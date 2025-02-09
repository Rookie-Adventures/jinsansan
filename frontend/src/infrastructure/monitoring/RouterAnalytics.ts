import { PerformanceMonitor } from './PerformanceMonitor';

export interface IRouteAnalytics {
  path: string;
  timestamp: number;
  navigationType: 'push' | 'pop' | 'replace' | 'initial';
  previousPath?: string;
  duration?: number;
}

export class RouterAnalytics {
  private static instance: RouterAnalytics;
  private analytics: IRouteAnalytics[] = [];
  private lastPath?: string;
  private lastTimestamp?: number;
  private performanceMonitor: PerformanceMonitor;
  private routeStats: Record<string, number> = {};
  private routeDurations: Record<string, number[]> = {};
  
  // 新增：路由切换动画相关的属性
  private transitionStartTime?: number;
  private transitionFrames: number[] = [];
  private activeTransition = false;

  // 新增：预加载相关的属性
  private preloadRequests: Map<string, { 
    startTime: number;
    promise: Promise<void>;
    fromCache: boolean;
    resolve: () => void;
  }> = new Map();
  private activePreloads: Map<string, number> = new Map();
  private preloadStats = {
    totalRequests: 0,
    cacheHits: 0,
    successCount: 0,
    failureCount: 0,
    deduplicationCount: 0
  };

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  public static getInstance(): RouterAnalytics {
    if (!RouterAnalytics.instance) {
      RouterAnalytics.instance = new RouterAnalytics();
    }
    return RouterAnalytics.instance;
  }

  public trackRoute(path: string, navigationType: IRouteAnalytics['navigationType']): void {
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

    const analytics: IRouteAnalytics = {
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
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
        this.performanceMonitor.trackCustomMetric('initial_route_load', loadTime);
      }
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

  private async reportAnalytics(analytics: IRouteAnalytics): Promise<void> {
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
    } catch {
      this.performanceMonitor.trackCustomMetric('route_analytics_error', 1);
      this.performanceMonitor.trackCustomMetric('route_analytics_error_count', 1);
    }
  }

  // 用于测试的方法
  public clearAnalytics(): void {
    this.analytics = [];
    this.routeStats = {};
    this.routeDurations = {};
    this.lastPath = undefined;
    this.lastTimestamp = undefined;
    this.preloadStats = {
      totalRequests: 0,
      cacheHits: 0,
      successCount: 0,
      failureCount: 0,
      deduplicationCount: 0
    };
    this.preloadRequests.clear();
    this.activePreloads.clear();
  }

  // 新增：路由切换动画相关的方法
  public trackRouteTransitionStart(fromPath: string, toPath: string): void {
    this.transitionStartTime = Date.now();
    this.transitionFrames = [];
    this.activeTransition = true;

    // 记录路由转换的起点和终点
    console.debug(`Route transition: ${fromPath} -> ${toPath}`);

    // 开始记录帧率
    const recordFrame = () => {
      if (this.activeTransition) {
        this.transitionFrames.push(Date.now());
        requestAnimationFrame(recordFrame);
      }
    };
    requestAnimationFrame(recordFrame);
  }

  public trackRouteTransitionEnd(): void {
    if (!this.transitionStartTime) return;

    const duration = Date.now() - this.transitionStartTime;
    this.performanceMonitor.trackCustomMetric('route_transition_duration', duration);

    // 计算帧率
    if (this.transitionFrames.length > 1) {
      const totalTime = this.transitionFrames[this.transitionFrames.length - 1] - this.transitionFrames[0];
      const fps = totalTime > 0 ? (this.transitionFrames.length - 1) * 1000 / totalTime : 60;
      this.performanceMonitor.trackCustomMetric('route_transition_fps', fps);
    }

    // 检查性能问题
    if (duration > 300) {
      this.performanceMonitor.trackCustomMetric('route_transition_performance_issue', 1);
      this.performanceMonitor.trackCustomMetric('route_transition_long_duration', duration);
    }

    this.activeTransition = false;
    this.transitionStartTime = undefined;
    this.transitionFrames = [];
  }

  // 新增：预加载相关的方法
  public trackPreloadStart(path: string): Promise<void> {
    const existingRequest = this.preloadRequests.get(path);
    if (existingRequest) {
      this.preloadStats.deduplicationCount++;
      this.performanceMonitor.trackCustomMetric('route_preload_deduplication_count', this.preloadStats.deduplicationCount);
      return existingRequest.promise;
    }

    const startTime = Date.now();
    let resolvePromise!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    this.preloadRequests.set(path, {
      startTime,
      promise,
      fromCache: false,
      resolve: resolvePromise
    });

    this.activePreloads.set(path, (this.activePreloads.get(path) || 0) + 1);
    this.preloadStats.totalRequests++;

    // 立即解析 Promise，因为这只是跟踪开始
    resolvePromise();
    return promise;
  }

  public async trackPreloadEnd(
    path: string, 
    fromCache: boolean = false,
    resourceSizes?: { jsSize?: number; cssSize?: number; totalSize?: number }
  ): Promise<void> {
    const request = this.preloadRequests.get(path);
    if (!request) return;

    const duration = Date.now() - request.startTime;
    this.performanceMonitor.trackCustomMetric('route_preload_duration', duration);

    if (fromCache) {
      this.preloadStats.cacheHits++;
    }
    this.preloadStats.successCount++;

    // 记录资源大小
    if (resourceSizes) {
      if (resourceSizes.totalSize) {
        this.performanceMonitor.trackCustomMetric('route_preload_size', resourceSizes.totalSize);
      }
      if (resourceSizes.jsSize) {
        this.performanceMonitor.trackCustomMetric('route_preload_js_size', resourceSizes.jsSize);
      }
      if (resourceSizes.cssSize) {
        this.performanceMonitor.trackCustomMetric('route_preload_css_size', resourceSizes.cssSize);
      }
    }

    // 更新缓存命中率
    const cacheHitRate = this.preloadStats.totalRequests > 0 
      ? this.preloadStats.cacheHits / this.preloadStats.totalRequests 
      : 0;
    this.performanceMonitor.trackCustomMetric('route_preload_cache_hit_rate', cacheHitRate);

    // 更新成功率
    const total = this.preloadStats.successCount + this.preloadStats.failureCount;
    const successRate = total > 0 ? this.preloadStats.successCount / total : 0;
    this.performanceMonitor.trackCustomMetric('route_preload_success_rate', successRate);

    // 更新活动预加载计数
    const activeCount = this.activePreloads.get(path) || 0;
    if (activeCount > 0) {
      this.activePreloads.set(path, activeCount - 1);
    }

    // 清理请求记录
    this.preloadRequests.delete(path);
  }

  public async trackPreloadError(path: string, error: Error): Promise<void> {
    this.preloadStats.failureCount++;
    
    // 记录预加载错误
    this.performanceMonitor.trackCustomMetric('route_preload_error', 1);
    this.performanceMonitor.trackCustomMetric('route_preload_error_count', this.preloadStats.failureCount);

    // 记录错误详情
    console.error(`Route preload error for path ${path}:`, error.message);
    
    // 更新活动预加载计数
    const activeCount = this.activePreloads.get(path) || 0;
    if (activeCount > 0) {
      this.activePreloads.set(path, activeCount - 1);
    }

    // 更新成功率
    const total = this.preloadStats.successCount + this.preloadStats.failureCount;
    const successRate = total > 0 ? this.preloadStats.successCount / total : 0;
    this.performanceMonitor.trackCustomMetric('route_preload_success_rate', successRate);

    // 清理请求记录
    this.preloadRequests.delete(path);
  }

  public getActivePreloadCount(path: string): number {
    return this.activePreloads.get(path) || 0;
  }

  public getAnalytics(): IRouteAnalytics[] {
    return [...this.analytics];
  }
} 