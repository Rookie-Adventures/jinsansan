import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { handlers } from '../mocks/handlers';

// MSW 服务器设置
export const server = setupServer(...handlers);

// 全局 Mock 设置
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

// Mock localStorage
interface MockStorage {
  [key: string]: ReturnType<typeof vi.fn> | string | number | (() => Generator<[string, unknown], void, unknown>);
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  key: ReturnType<typeof vi.fn>;
  length: number;
}

const createMockStorage = (): MockStorage => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
  [Symbol.iterator]: function* () {
    yield* Object.entries(this);
  },
});

const localStorageMock = createMockStorage();

// Mock window.fetch
const fetchMock = vi.fn();

// 环境设置
beforeAll(() => {
  // 启动 MSW
  server.listen({ onUnhandledRequest: 'error' });

  // Mock window 对象
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  global.fetch = fetchMock;

  // Mock window.matchMedia
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

  // 设置 fake timers
  vi.useFakeTimers();
});

beforeEach(() => {
  // 重置所有 mocks
  vi.clearAllMocks();
  localStorageMock.clear.mockClear();
  fetchMock.mockClear();

  // 重置 localStorage 数据
  Object.keys(localStorageMock).forEach(key => {
    if (
      typeof key === 'string' &&
      !['getItem', 'setItem', 'removeItem', 'clear', 'key', 'length'].includes(key)
    ) {
      delete localStorageMock[key];
    }
  });
});

// 每个测试后清理
afterEach(() => {
  server.resetHandlers();
});

// 所有测试结束后清理
afterAll(() => {
  server.close();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
