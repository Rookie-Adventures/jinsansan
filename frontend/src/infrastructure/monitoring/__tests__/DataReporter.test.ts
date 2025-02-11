import { describe, it, beforeEach } from 'vitest';
import { DataReporter } from '../DataReporter';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { validateMetrics } from '@/test/utils/performanceTestUtils';
import { setupMockFetch, setupMockErrorLogger } from '@/test/utils/mockSetup';
import { errorLogger } from '../../../utils/errorLogger';
import { vi } from 'vitest';

// Mock errorLogger
vi.mock('../../../utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

setupMockErrorLogger();
const mockFetch = setupMockFetch();

describe('DataReporter', () => {
  let reporter: DataReporter;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    reporter = new DataReporter(performanceMonitor);
  });

  it('should track custom metrics', () => {
    performanceMonitor.trackCustomMetric('test-metric', 100);
    validateMetrics(performanceMonitor.getMetrics(), 'custom');
  });

  it('should flush metrics', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    performanceMonitor.trackCustomMetric('test-metric', 100);
    
    await reporter.flush();
    
    expect(performanceMonitor.getMetrics()).toHaveLength(0);
  });

  it('should handle flush errors', async () => {
    const mockError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(mockError);

    performanceMonitor.trackCustomMetric('test-metric', 100);
    
    await reporter.flush();
    
    expect(errorLogger.log).toHaveBeenCalledWith(mockError);
  });
});
