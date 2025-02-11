import { vi } from 'vitest';

export class MockPerformanceObserver {
  private callback: (list: any) => void;

  constructor(callback: (list: any) => void) {
    this.callback = callback;
  }

  observe() {
    // Store the observer for testing
    mockObservers.push(this);
  }

  // Helper method for tests to trigger callbacks
  triggerCallback(entries: any[]) {
    this.callback({
      getEntries: () => entries,
    });
  }
}

const mockObservers: MockPerformanceObserver[] = [];

export const setupMockPerformanceObserver = () => {
  const mockObserver = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    callback: null as any,
  };

  (global as any).PerformanceObserver = vi.fn((callback) => {
    mockObserver.callback = callback;
    return mockObserver;
  });

  return mockObserver;
};

export const validateMetrics = (metrics: any[], expectedType: string) => {
  expect(metrics).toHaveLength(1);
  expect(metrics[0]).toMatchObject({ type: expectedType });
};

export const createMockEntry = (type: string, data = {}) => {
  return {
    entryType: type,
    toJSON: () => ({ type, ...data }),
  };
}; 