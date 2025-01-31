import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// 在所有测试开始前设置
beforeAll(() => {
  // 确保开始时使用真实定时器
  vi.useRealTimers();
});

// 在所有测试结束后清理
afterAll(() => {
  // 确保结束时使用真实定时器
  vi.useRealTimers();
});

// 在每个测试后清理
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // 确保每个测试后重置为真实定时器
  vi.useRealTimers();
});

// 模拟 console.error，避免测试输出太多错误信息
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// 模拟 Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
};

// 添加自定义匹配器
expect.extend({
  toHaveBeenCalledAfter(received: any, other: any) {
    const receivedCalls = received.mock.invocationCallOrder;
    const otherCalls = other.mock.invocationCallOrder;

    if (receivedCalls.length === 0) {
      return {
        message: () => 'Expected function to have been called',
        pass: false,
      };
    }

    if (otherCalls.length === 0) {
      return {
        message: () => 'Expected comparison function to have been called',
        pass: false,
      };
    }

    const pass = Math.min(...receivedCalls) > Math.max(...otherCalls);

    return {
      message: () =>
        pass
          ? 'Expected function to not have been called after comparison function'
          : 'Expected function to have been called after comparison function',
      pass,
    };
  },
});
