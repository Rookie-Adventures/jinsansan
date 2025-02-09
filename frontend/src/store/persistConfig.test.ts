import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistConfig } from './persistConfig';
import storage from 'redux-persist/lib/storage';

// Mock storage
vi.mock('redux-persist/lib/storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

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
        error: new Error('test')
      };

      // 测试 in 转换
      const inboundState = persistConfig.transforms[0].in(authState, 'auth');
      expect(inboundState).toEqual({
        token: 'test-token',
        user: { id: 1, username: undefined }
      });

      // 测试 out 转换
      const outboundState = persistConfig.transforms[0].out(authState, 'auth');
      expect(outboundState).toEqual(authState);
    });

    it('应该正确转换主题状态', () => {
      const themeState = {
        mode: 'dark',
        customizations: { primaryColor: '#000000' },
        fontSize: 16
      };

      // 测试 in 转换
      const inboundState = persistConfig.transforms[1].in(themeState, 'theme');
      expect(inboundState).toEqual({
        mode: 'dark',
        customizations: { primaryColor: '#000000' }
      });
      expect(inboundState.fontSize).toBeUndefined();

      // 测试 out 转换
      const outboundState = persistConfig.transforms[1].out(themeState, 'theme');
      expect(outboundState).toEqual(themeState);
    });

    it('应该忽略不在whitelist中的状态', () => {
      const otherState = {
        data: 'test'
      };

      // 测试 in 转换
      const inboundState = persistConfig.transforms[0].in(otherState, 'other');
      expect(inboundState).toEqual(otherState);

      // 测试 out 转换
      const outboundState = persistConfig.transforms[0].out(otherState, 'other');
      expect(outboundState).toEqual(otherState);
    });
  });

  describe('migrate', () => {
    it('应该正确处理版本迁移', async () => {
      const oldState = {
        _persist: { version: 0 },
        auth: {
          token: 'old-token',
          user: { id: 1, username: 'test' }
        }
      };

      const migratedState = await persistConfig.migrate(oldState, 0);
      expect(migratedState.auth).toEqual({
        token: 'old-token',
        user: { id: 1, username: 'test' }
      });
    });

    it('应该处理无效的旧状态', async () => {
      const invalidState = null;
      const migratedState = await persistConfig.migrate(invalidState, 0);
      expect(migratedState).toEqual({});
    });
  });

  describe('stateReconciler', () => {
    it('应该正确合并状态', () => {
      const inboundState = {
        auth: {
          token: 'new-token',
          user: { id: 2 }
        }
      };

      const originalState = {
        auth: {
          token: 'old-token',
          user: { id: 1 },
          loading: false
        }
      };

      const reconciledState = persistConfig.stateReconciler(inboundState, originalState, originalState, {
        debug: false
      });

      expect(reconciledState).toEqual({
        auth: {
          token: 'new-token',
          user: { id: 2 }
        }
      });
    });
  });
}); 