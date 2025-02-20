import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';

import { mockAllBrowserApis } from '@/test/utils/mockBrowserApis';

// 扩展 Vitest 的匹配器
expect.extend({
  toHaveBeenCalledExactlyOnceWith(received: ReturnType<typeof vi.fn>, ...expectedArgs: unknown[]) {
    const pass =
      received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expectedArgs);

    return {
      pass,
      message: () => (pass ? `期望函数没有被调用一次或参数不匹配` : `期望函数被调用一次且参数匹配`),
    };
  },
});

// 设置全局的测试超时时间
vi.setConfig({ testTimeout: 10000 });

// 在所有测试开始前设置
beforeAll(() => {
  // 模拟所有浏览器 API
  mockAllBrowserApis();
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
