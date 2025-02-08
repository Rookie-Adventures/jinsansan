import { errorLogger } from '../../utils/errorLogger';
import { PerformanceMetric } from './types';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startTimer(id: string): void {
    this.timers.set(id, performance.now());
  }

  public stopTimer(id: string): number {
    const startTime = this.timers.get(id);
    if (startTime === undefined) {
      throw new Error(`No timer found with id: ${id}`);
    }
    const duration = performance.now() - startTime;
    this.timers.delete(id);
    return duration;
  }

  public recordMetric(name: string, value: number, tags: Record<string, any> = {}): void {
    this.metrics.push({
      type: 'custom',
      timestamp: Date.now(),
      data: {
        name,
        value,
        tags
      }
    });
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
    try {
      if (name === null || name === undefined) {
        throw new Error('Metric name cannot be null or undefined');
      }
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Metric value must be a valid number');
      }

      this.metrics.push({
        type: 'custom',
        timestamp: Date.now(),
        data: {
          name,
          value
        }
      });
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Invalid metric data'), { level: 'error' });
    }
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
      } else {
        errorLogger.log(new Error(`Failed to report metrics: ${response.statusText}`), { level: 'error' });
      }
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Failed to report metrics'), { level: 'error' });
    }
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
} 