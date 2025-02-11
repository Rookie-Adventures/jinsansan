import { vi } from 'vitest';

// 导出所有测试工具
export * from './storage';
export * from './network';

/**
 * 设置性能监控 API 的模拟实现
 * @returns 模拟的 performance.now 函数
 */
export const setupMockPerformanceAPI = () => {
  const mockPerformanceNow = vi.fn();
  Object.defineProperty(global, 'performance', {
    value: {
      now: mockPerformanceNow,
      timing: {
        navigationStart: 0,
        domComplete: 1000,
        loadEventEnd: 1200,
        domInteractive: 800,
        domContentLoadedEventEnd: 900,
      },
    },
  });
  return mockPerformanceNow;
};

/**
 * 设置错误日志记录器的模拟实现
 * @returns 模拟的日志记录器对象
 */
export const setupMockErrorLogger = () => {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
};

export interface MockMatchMediaOptions {
  matches?: boolean;
  media?: string;
  onchange?: null | (() => void);
  addListener?: ReturnType<typeof vi.fn>;
  removeListener?: ReturnType<typeof vi.fn>;
  addEventListener?: ReturnType<typeof vi.fn>;
  removeEventListener?: ReturnType<typeof vi.fn>;
  dispatchEvent?: ReturnType<typeof vi.fn>;
}

/**
 * 设置 window.matchMedia 的模拟实现
 * @param options 配置选项
 * @returns 模拟的 matchMedia 配置选项
 */
export const setupMockMatchMedia = (options: Partial<MockMatchMediaOptions> = {}) => {
  const defaultOptions: MockMatchMediaOptions = {
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  const mockOptions = { ...defaultOptions, ...options };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      ...mockOptions,
      media: query,
    })),
  });

  return mockOptions;
}; 