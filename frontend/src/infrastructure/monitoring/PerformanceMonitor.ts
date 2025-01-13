import { MetricType, PerformanceMetric } from './types.ts';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly SEND_INTERVAL = 10000; // 10秒

  private constructor() {
    this.startAutoSend();
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // 页面加载性能
    this.observePageLoadMetrics();
    // 资源加载性能
    this.observeResourceTiming();
    // 长任务监控
    this.observeLongTasks();
    // 用户交互监控
    this.observeUserInteractions();
  }

  private observePageLoadMetrics(): void {
    window.addEventListener('load', () => {
      const pageLoadMetrics = this.getPageLoadMetrics();
      this.recordMetric('page_load', pageLoadMetrics);
    });
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric('resource', {
          name: entry.name,
          duration: entry.duration,
          type: entry.entryType,
        });
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private observeLongTasks(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric('long_task', {
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  private observeUserInteractions(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric('interaction', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });

    observer.observe({ entryTypes: ['first-input', 'event'] });
  }

  private getPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domComplete: navigation.domComplete,
      loadEventEnd: navigation.loadEventEnd,
      domInteractive: navigation.domInteractive,
      domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
    };
  }

  private recordMetric(type: MetricType, data: any): void {
    const metric: PerformanceMetric = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.metrics.push(metric);

    if (this.metrics.length >= this.BATCH_SIZE) {
      this.sendMetrics();
    }
  }

  private startAutoSend(): void {
    setInterval(() => {
      this.sendMetrics();
    }, this.SEND_INTERVAL);
  }

  private async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const metricsToSend = [...this.metrics];
      this.metrics = [];

      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: metricsToSend }),
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.debug('Performance metrics:', metricsToSend);
      }
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // 失败时将指标放回队列
      this.metrics = [...this.metrics, ...this.metrics];
    }
  }

  // 公共API
  public trackCustomMetric(name: string, value: number): void {
    this.recordMetric('custom', { name, value });
  }

  public trackApiCall(url: string, duration: number, success: boolean): void {
    this.recordMetric('api_call', { url, duration, success });
  }
} 