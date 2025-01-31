import { beforeEach, describe, expect, vi } from 'vitest';
import { PerformanceMonitor } from '../PerformanceMonitor';

// 类型定义
interface ApiCallMetric {
  type: string;
  data: {
    url: string;
    success: boolean;
    duration: number;
  };
}

describe('HTTP Request Monitoring', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.clearMetrics();
  });

  describe('API调用监控', () => {
    it('should track API calls', () => {
      const url = '/api/test';
      const duration = 200;
      const success = true;

      performanceMonitor.trackApiCall(url, duration, success);

      const metrics = performanceMonitor.getMetrics();
      const apiCallMetric = metrics.find(m => m.type === 'api_call') as ApiCallMetric;

      expect(apiCallMetric).toBeDefined();
      expect(apiCallMetric.data).toEqual({
        url,
        duration,
        success,
      });
    });
  });
});
