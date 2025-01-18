import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PerformanceMonitor } from '../PerformanceMonitor';

// 添加类型定义
interface MockPerformanceTiming {
  navigationStart: number;
  domComplete: number;
  loadEventEnd: number;
  domInteractive: number;
  domContentLoadedEventEnd: number;
}

interface MockPerformance {
  timing: MockPerformanceTiming;
}

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = PerformanceMonitor.getInstance();
  });

  describe('页面加载性能监控', () => {
    it('should collect page load metrics', () => {
      const mockPerformance: MockPerformance = {
        timing: {
          navigationStart: 1000,
          domComplete: 2000,
          loadEventEnd: 2500,
          domInteractive: 1500,
          domContentLoadedEventEnd: 1800
        }
      };

      global.performance = mockPerformance as unknown as Performance;
      
      monitor.observePageLoadMetrics();
      
      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'page_load',
        data: expect.objectContaining({
          domComplete: 1000,  // 2000 - 1000
          loadEventEnd: 1500, // 2500 - 1000
          domInteractive: 500,// 1500 - 1000
          domContentLoadedEventEnd: 800 // 1800 - 1000
        })
      }));
    });
  });

  // ... rest of the test cases ...
}); 