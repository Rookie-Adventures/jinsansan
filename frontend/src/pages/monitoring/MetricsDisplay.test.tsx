import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import type {
  PerformanceMetric,
  PageLoadMetrics,
  CustomMetrics,
  ApiCallMetrics,
} from '@/infrastructure/monitoring/types';

import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';
import { MetricType } from '@/infrastructure/monitoring/types';


import { MetricsDisplay } from './MetricsDisplay';

// Mock PerformanceMonitor
vi.mock('@/infrastructure/monitoring/PerformanceMonitor');

describe('MetricsDisplay', () => {
  const mockMetrics: PerformanceMetric[] = [
    {
      type: MetricType.PAGE_LOAD,
      timestamp: Date.now(),
      data: {
        domComplete: 1200,
        loadEventEnd: 1500,
        domInteractive: 800,
        domContentLoadedEventEnd: 1000,
      } as PageLoadMetrics,
    },
    {
      type: MetricType.CUSTOM,
      timestamp: Date.now(),
      data: {
        name: 'Memory Usage',
        value: 75,
        tags: { unit: 'MB' },
      } as CustomMetrics,
    },
    {
      type: MetricType.API_CALL,
      timestamp: Date.now(),
      data: {
        url: '/api/data',
        duration: 1500,
        success: true,
      } as ApiCallMetrics,
    },
  ];

  const mockGetMetrics = vi.fn(() => mockMetrics);

  beforeEach(() => {
    vi.useFakeTimers();
    mockGetMetrics.mockClear();

    vi.mocked(PerformanceMonitor.getInstance).mockReturnValue({
      metrics: [],
      timers: new Map(),
      startTimer: vi.fn(),
      stopTimer: vi.fn(),
      recordMetric: vi.fn(),
      observePageLoadMetrics: vi.fn(),
      observeResourceTiming: vi.fn(),
      observeLongTasks: vi.fn(),
      observeUserInteractions: vi.fn(),
      trackCustomMetric: vi.fn(),
      trackApiCall: vi.fn(),
      getMetrics: mockGetMetrics,
      flush: vi.fn(),
      clearMetrics: vi.fn(),
    } as unknown as PerformanceMonitor);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the component title', () => {
    render(<MetricsDisplay />);
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('displays metrics with correct values', () => {
    render(<MetricsDisplay />);

    // Check page load metric
    expect(screen.getByText('Page Load Time')).toBeInTheDocument();
    expect(screen.getByText('1200ms')).toBeInTheDocument();

    // Check custom metric
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();

    // Check API call metric
    expect(screen.getByText('/api/data')).toBeInTheDocument();
    expect(screen.getByText('1500ms')).toBeInTheDocument();
  });

  it('updates metrics every 5 seconds', async () => {
    render(<MetricsDisplay />);

    // Initial render
    expect(mockGetMetrics).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1200ms')).toBeInTheDocument();

    // Update mock metrics for next interval
    const updatedMetrics = [...mockMetrics];
    updatedMetrics[0] = {
      ...mockMetrics[0],
      data: {
        ...(mockMetrics[0].data as PageLoadMetrics),
        domComplete: 800,
      },
    };
    mockGetMetrics.mockReturnValueOnce(updatedMetrics);

    // Fast-forward time and wait for update
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Verify updates
    expect(mockGetMetrics).toHaveBeenCalledTimes(2);
    expect(screen.getByText('800ms')).toBeInTheDocument();
  });

  it('displays correct color based on metric values', () => {
    render(<MetricsDisplay />);

    // API call duration > 1000ms should be red
    const apiMetric = screen.getByText('1500ms');
    expect(apiMetric).toHaveStyle({ color: '#f44336' });

    // Memory usage < 80 should be green
    const memoryMetric = screen.getByText('75');
    expect(memoryMetric).toHaveStyle({ color: '#4caf50' });
  });
});
