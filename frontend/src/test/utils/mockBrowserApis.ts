import { vi } from 'vitest';

/**
 * 模拟浏览器的 matchMedia API
 */
export const mockMatchMedia = (): void => {
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
};

/**
 * 模拟 ResizeObserver API
 */
export const mockResizeObserver = (): void => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
};

/**
 * 模拟 IntersectionObserver API
 */
export const mockIntersectionObserver = (): void => {
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = '0px';
    thresholds: ReadonlyArray<number> = [0];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);
  };
};

/**
 * 模拟 Fetch API
 */
export const mockFetch = (): void => {
  global.fetch = vi.fn();
};

/**
 * 模拟环境变量
 */
export const mockEnv = (): void => {
  process.env.NODE_ENV = 'test';
  process.env.VITE_API_URL = 'http://localhost:3000';
};

/**
 * 模拟所有浏览器 API
 */
export const mockAllBrowserApis = (): void => {
  mockMatchMedia();
  mockResizeObserver();
  mockIntersectionObserver();
  mockFetch();
  mockEnv();
}; 