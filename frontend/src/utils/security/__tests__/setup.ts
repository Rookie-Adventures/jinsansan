import { vi } from 'vitest';
import { setupMockLocalStorage } from '@/test/utils/storage';
import { setupMockFetch, setupMockNavigator } from '@/test/utils/network';

// 设置模拟的环境
setupMockLocalStorage();
setupMockFetch();
setupMockNavigator();

// 每个测试前重置所有模拟
beforeEach(() => {
  vi.clearAllMocks();
});
