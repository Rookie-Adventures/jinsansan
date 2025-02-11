import { PerformanceMonitor } from './PerformanceMonitor';
import { errorLogger } from '../../utils/errorLogger';

export class DataReporter {
  private performanceMonitor: PerformanceMonitor;

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  async flush(): Promise<void> {
    const metrics = this.performanceMonitor.getMetrics();
    if (metrics.length === 0) {
      return;
    }

    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        throw new Error(`Failed to report metrics: ${response.statusText}`);
      }

      this.performanceMonitor.clearMetrics();
    } catch (error) {
      errorLogger.log(error as Error);
    }
  }
} 