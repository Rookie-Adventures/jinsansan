import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';

// 扩展 Vitest 的匹配器
expect.extend({
  toHaveBeenCalledExactlyOnceWith(received: ReturnType<typeof vi.fn>, ...expectedArgs: unknown[]) {
    const pass = received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expectedArgs);

    return {
      pass,
      message: () => pass
        ? `期望函数没有被调用一次或参数不匹配`
        : `期望函数被调用一次且参数匹配`
    };
  }
});

// Mock matchMedia
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

// Mock fetch API
global.fetch = vi.fn();

// Mock process.env
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3000';

// 设置全局的测试超时时间
vi.setConfig({ testTimeout: 10000 });

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
}); 