import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = PerformanceMonitor.getInstance();
  });

  describe('页面加载性能监控', () => {
    it('should collect page load metrics', () => {
      const mockPerformance = {
        timing: {
          navigationStart: 1000,
          domComplete: 2000,
          loadEventEnd: 2500,
          domInteractive: 1500,
          domContentLoadedEventEnd: 1800
        }
      };

      global.performance = mockPerformance as any;
      
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

  describe('资源加载性能监控', () => {
    it('should track resource timing', () => {
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn()
      };

      class MockPerformanceObserver {
        constructor(callback: PerformanceObserverCallback) {
          mockObserver.observe = vi.fn(() => {
            const mockList = {
              getEntries: () => [{
                name: 'https://example.com/style.css',
                duration: 500,
                initiatorType: 'css'
              }],
              getEntriesByName: () => [],
              getEntriesByType: () => []
            } as unknown as PerformanceObserverEntryList;

            callback(mockList, this as unknown as PerformanceObserver);
          });
          return mockObserver;
        }
        static supportedEntryTypes = ['resource'];
      }

      global.PerformanceObserver = MockPerformanceObserver as any;
      
      monitor.observeResourceTiming();
      
      expect(mockObserver.observe).toHaveBeenCalledWith({ 
        entryTypes: ['resource'] 
      });

      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'resource',
        data: expect.objectContaining({
          name: 'https://example.com/style.css',
          duration: 500,
          type: 'css'
        })
      }));
    });
  });

  describe('长任务监控', () => {
    it('should track long tasks', () => {
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn()
      };

      class MockPerformanceObserver {
        constructor(callback: PerformanceObserverCallback) {
          mockObserver.observe = vi.fn(() => {
            const mockList = {
              getEntries: () => [{
                duration: 100,
                startTime: 1000
              }],
              getEntriesByName: () => [],
              getEntriesByType: () => []
            } as unknown as PerformanceObserverEntryList;

            callback(mockList, this as unknown as PerformanceObserver);
          });
          return mockObserver;
        }
        static supportedEntryTypes = ['longtask'];
      }

      global.PerformanceObserver = MockPerformanceObserver as any;
      
      monitor.observeLongTasks();
      
      expect(mockObserver.observe).toHaveBeenCalledWith({ 
        entryTypes: ['longtask'] 
      });

      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'long_task',
        data: expect.objectContaining({
          duration: 100,
          startTime: 1000
        })
      }));
    });
  });

  describe('用户交互监控', () => {
    it('should track user interactions', () => {
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn()
      };

      class MockPerformanceObserver {
        constructor(callback: PerformanceObserverCallback) {
          mockObserver.observe = vi.fn(() => {
            const mockList = {
              getEntries: () => [{
                name: 'click',
                duration: 50,
                startTime: 2000
              }],
              getEntriesByName: () => [],
              getEntriesByType: () => []
            } as unknown as PerformanceObserverEntryList;

            callback(mockList, this as unknown as PerformanceObserver);
          });
          return mockObserver;
        }
        static supportedEntryTypes = ['event'];
      }

      global.PerformanceObserver = MockPerformanceObserver as any;
      
      monitor.observeUserInteractions();
      
      expect(mockObserver.observe).toHaveBeenCalledWith({ 
        entryTypes: ['event'] 
      });

      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'interaction',
        data: expect.objectContaining({
          name: 'click',
          duration: 50,
          startTime: 2000
        })
      }));
    });
  });

  describe('自定义指标', () => {
    it('should track custom metrics', () => {
      monitor.trackCustomMetric('test-metric', 100);

      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'custom',
        data: expect.objectContaining({
          name: 'test-metric',
          value: 100
        })
      }));
    });
  });

  describe('API调用监控', () => {
    it('should track API calls', () => {
      monitor.trackApiCall('/api/test', 200, true);

      const metrics = monitor.getMetrics();
      expect(metrics).toContainEqual(expect.objectContaining({
        type: 'api_call',
        data: expect.objectContaining({
          url: '/api/test',
          duration: 200,
          success: true
        })
      }));
    });
  });

  describe('批量处理和上报', () => {
    it('should batch process metrics', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      monitor.trackCustomMetric('test1', 100);
      monitor.trackCustomMetric('test2', 200);
      monitor.trackApiCall('/api/test', 300, true);

      await monitor.flush();

      expect(mockFetch).toHaveBeenCalledWith('/api/metrics', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.any(String)
      }));

      expect(monitor.getMetrics()).toHaveLength(0);
    });

    it('should handle upload failures', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      monitor.trackCustomMetric('test', 100);
      
      await monitor.flush();

      expect(monitor.getMetrics()).toHaveLength(1);
    });
  });
}); 