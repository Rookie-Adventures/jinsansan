import type { Transform, PersistedState } from 'redux-persist/es/types';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { persistConfig } from './persistConfig';
import type { RootState } from './types';


// Mock storage
vi.mock('redux-persist/lib/storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const createMockRootState = (data: Partial<RootState> = {}): RootState => ({
  app: {
    darkMode: false,
    loading: false,
    toast: {
      open: false,
      message: '',
      severity: 'info',
    },
  },
  auth: {
    token: null,
    user: null,
    loading: false,
    error: null,
  },
  ...data,
});

describe('persistConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础配置', () => {
    it('应该有正确的key配置', () => {
      expect(persistConfig.key).toBe('root');
    });

    it('应该使用正确的storage', () => {
      expect(persistConfig.storage).toBe(storage);
    });

    it('应该有正确的whitelist', () => {
      expect(persistConfig.whitelist).toEqual(['auth', 'theme']);
    });
  });

  describe('transforms', () => {
    it('应该正确转换认证状态', () => {
      const authState = {
        token: 'test-token',
        user: { id: 1, name: 'test' },
        isAuthenticated: true,
        loading: true,
        error: new Error('test'),
      };

      const transforms = persistConfig.transforms as Transform<RootState, any>[];
      expect(transforms).toBeDefined();

      // 测试 in 转换
      const mockState = createMockRootState();
      const inboundState = transforms[0].in(authState as any, 'auth', mockState);
      expect(inboundState).toEqual({
        token: 'test-token',
        user: { id: 1, username: undefined },
      });

      // 测试 out 转换
      const outboundState = transforms[0].out(authState as any, 'auth', mockState);
      expect(outboundState).toEqual(authState);
    });

    it('应该正确转换主题状态', () => {
      const themeState = {
        mode: 'dark',
        customizations: { primaryColor: '#000000' },
        fontSize: 16,
      };

      const transforms = persistConfig.transforms as Transform<RootState, any>[];
      expect(transforms).toBeDefined();

      // 测试 in 转换
      const mockState = createMockRootState();
      const inboundState = transforms[1].in(themeState as any, 'theme', mockState);
      expect(inboundState).toEqual({
        mode: 'dark',
        customizations: { primaryColor: '#000000' },
      });
      expect(inboundState.fontSize).toBeUndefined();

      // 测试 out 转换
      const outboundState = transforms[1].out(themeState as any, 'theme', mockState);
      expect(outboundState).toEqual(themeState);
    });

    it('应该忽略不在whitelist中的状态', () => {
      const otherState = {
        data: 'test',
      };

      const transforms = persistConfig.transforms as Transform<RootState, any>[];
      expect(transforms).toBeDefined();

      // 测试 in 转换
      const mockState = createMockRootState();
      const inboundState = transforms[0].in(otherState as any, 'other', mockState);
      expect(inboundState).toEqual(otherState);

      // 测试 out 转换
      const outboundState = transforms[0].out(otherState as any, 'other', mockState);
      expect(outboundState).toEqual(otherState);
    });
  });

  describe('migrate', () => {
    it('应该正确处理版本迁移', async () => {
      const oldState = {
        _persist: { version: 0, rehydrated: true },
        auth: {
          token: 'old-token',
          user: {
            id: 1,
            username: 'test',
          },
        },
      } as PersistedState;

      expect(persistConfig.migrate).toBeDefined();
      if (persistConfig.migrate) {
        const migratedState = await persistConfig.migrate(oldState, 0);
        // 只验证关键字段
        expect(migratedState).toMatchObject({
          _persist: { version: 0, rehydrated: true },
          auth: {
            token: 'old-token',
            user: expect.objectContaining({
              id: 1,
              username: 'test',
            }),
          },
        });
      }
    });

    it('应该处理无效的旧状态', async () => {
      expect(persistConfig.migrate).toBeDefined();
      if (persistConfig.migrate) {
        const migratedState = await persistConfig.migrate(
          {
            _persist: { version: 0, rehydrated: true },
          } as PersistedState,
          0
        );

        // 验证基本结构而不是空对象
        expect(migratedState).toMatchObject({
          _persist: { version: 0, rehydrated: true },
          auth: null,
        });
      }
    });
  });

  describe('stateReconciler', () => {
    it('应该正确合并状态', () => {
      const inboundState = {
        auth: {
          token: 'new-token',
          user: {
            id: 2,
            username: 'test',
            email: 'test@example.com',
            permissions: [],
          },
        },
      };

      const originalState = {
        app: {
          darkMode: false,
          loading: false,
          toast: {
            open: false,
            message: '',
            severity: 'info',
          },
        },
        auth: {
          token: 'old-token',
          user: {
            id: 1,
            username: 'old-test',
            email: 'old@example.com',
            permissions: [],
          },
        },
      };

      const reconciledState = autoMergeLevel2(inboundState, originalState, originalState, {
        storage,
        key: 'root',
      });

      // 验证合并后的状态
      expect(reconciledState).toMatchObject({
        app: originalState.app, // 保留原始的 app 状态
        auth: {
          token: 'new-token',
          user: {
            id: 2,
            username: 'test',
            email: 'test@example.com',
            permissions: [],
          },
        },
      });
    });
  });
});
