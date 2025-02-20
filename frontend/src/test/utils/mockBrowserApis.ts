import { vi } from 'vitest';

/**
 * @fileoverview 浏览器 API 模拟工具
 * 
 * 这个文件提供了测试环境中常用的浏览器 API 模拟实现：
 * - matchMedia: 用于响应式设计测试
 * - ResizeObserver: 用于元素大小变化监听
 * - IntersectionObserver: 用于元素可见性监听
 * - Fetch API: 用于网络请求模拟
 * - 环境变量: 用于测试环境配置
 */

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