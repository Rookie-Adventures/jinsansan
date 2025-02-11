import { vi } from 'vitest';

export interface MockStorage {
  store: Map<string, string>;
  mock: Storage;
}

/**
 * 创建模拟的 Storage 实现（可用于 localStorage 或 sessionStorage）
 * @returns MockStorage 对象，包含存储实例和模拟对象
 */
export const createMockStorage = (): MockStorage => {
  const store = new Map<string, string>();
  const storageMock = {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    length: 0,
    key: vi.fn((_: number) => null),
  } as Storage;

  return {
    store,
    mock: storageMock,
  };
};

/**
 * 设置全局的 localStorage 模拟
 * @returns MockStorage 对象，包含存储实例和模拟对象
 */
export const setupMockLocalStorage = (): MockStorage => {
  const mockStorage = createMockStorage();
  
  Object.defineProperty(global, 'localStorage', {
    value: mockStorage.mock,
    writable: true
  });

  return mockStorage;
};

/**
 * 设置全局的 sessionStorage 模拟
 * @returns MockStorage 对象，包含存储实例和模拟对象
 */
export const setupMockSessionStorage = (): MockStorage => {
  const mockStorage = createMockStorage();
  
  Object.defineProperty(global, 'sessionStorage', {
    value: mockStorage.mock,
    writable: true
  });

  return mockStorage;
}; 