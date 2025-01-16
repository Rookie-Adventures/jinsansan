export interface PerformanceMetric {
  type: string;
  timestamp: number;
  data: any;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public observePageLoadMetrics(): void {
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;

    this.metrics.push({
      type: 'page_load',
      timestamp: Date.now(),
      data: {
        domComplete: timing.domComplete - navigationStart,
        loadEventEnd: timing.loadEventEnd - navigationStart,
        domInteractive: timing.domInteractive - navigationStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd - navigationStart
      }
    });
  }

  public observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      entries.forEach(entry => {
        this.metrics.push({
          type: 'resource',
          timestamp: Date.now(),
          data: {
            name: entry.name,
            duration: entry.duration,
            type: entry.initiatorType
          }
        });
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  public observeLongTasks(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.push({
          type: 'long_task',
          timestamp: Date.now(),
          data: {
            duration: entry.duration,
            startTime: entry.startTime
          }
        });
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  public observeUserInteractions(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.push({
          type: 'interaction',
          timestamp: Date.now(),
          data: {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          }
        });
      });
    });

    observer.observe({ entryTypes: ['event'] });
  }

  public trackCustomMetric(name: string, value: number): void {
    this.metrics.push({
      type: 'custom',
      timestamp: Date.now(),
      data: {
        name,
        value
      }
    });
  }

  public trackApiCall(url: string, duration: number, success: boolean): void {
    this.metrics.push({
      type: 'api_call',
      timestamp: Date.now(),
      data: {
        url,
        duration,
        success
      }
    });
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.metrics)
      });

      if (response.ok) {
        this.metrics = [];
      }
    } catch (error) {
      console.error('Failed to upload metrics:', error);
    }
  }
} 