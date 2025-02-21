import storage from 'redux-persist/lib/storage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { RootState } from '../types';
import type { AuthState } from '@/types/auth';
import type { User } from '@/types/user';
import type { PersistMigrate, StateReconciler, Transform, PersistConfig } from 'redux-persist';
import type { PersistedState } from 'redux-persist/es/types';

import { createPersistConfig } from '../persistConfig';

type StoredAuthState = Pick<AuthState, 'token' | 'user'>;

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

  describe('createPersistConfig', () => {
    it('should create config with correct key', () => {
      const config = createPersistConfig<RootState>('test');
      expect(config.key).toBe('test');
    });

    it('should include correct whitelist', () => {
      const config = createPersistConfig<RootState>('test');
      expect(config.whitelist).toEqual(['auth']);
    });

    it('should set correct version', () => {
      const config = createPersistConfig<RootState>('test');
      expect(config.version).toBe(0);
    });

    it('should include auth transform', () => {
      const config = createPersistConfig<RootState>('test');
      expect(config.transforms).toHaveLength(1);
    });

    it('should set debug based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'development';
      const devConfig = createPersistConfig<RootState>('test');
      expect(devConfig.debug).toBe(true);

      process.env.NODE_ENV = 'production';
      const prodConfig = createPersistConfig<RootState>('test');
      expect(prodConfig.debug).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use correct storage', () => {
      const config = createPersistConfig<RootState>('test');
      expect(config.storage).toBe(storage);
    });
  });

  describe('transforms', () => {
    const config = createPersistConfig<RootState>('test');
    const [authTransform] = (config.transforms || []) as [Transform<AuthState, StoredAuthState>];

    describe('authTransform', () => {
      it('should handle inbound state transformation', () => {
        const mockUser: User = {
          id: 1,
          username: 'test',
          email: 'test@example.com',
          permissions: []
        };

        const inboundState: AuthState = {
          token: 'test-token',
          user: { ...mockUser, other: 'data' } as any,
          loading: false,
          error: null,
        };

        const result = authTransform.in(inboundState, 'auth', {} as RootState);
        expect(result).toEqual({
          token: 'test-token',
          user: mockUser,
        });
      });

      it('should handle null user in inbound state', () => {
        const inboundState: AuthState = {
          token: 'test-token',
          user: null,
          loading: false,
          error: null,
        };

        const result = authTransform.in(inboundState, 'auth', {} as RootState);
        expect(result).toEqual({
          token: 'test-token',
          user: null,
        });
      });

      it('should handle undefined inbound state', () => {
        const result = authTransform.in({} as AuthState, 'auth', {} as RootState);
        expect(result).toEqual({});
      });

      it('should handle outbound state transformation', () => {
        const mockUser: User = {
          id: 1,
          username: 'test',
          email: 'test@example.com',
          permissions: []
        };

        const outboundState: StoredAuthState = {
          token: 'test-token',
          user: mockUser,
        };

        const mockRootState = createMockRootState({
          auth: {
            token: 'test-token',
            user: mockUser,
            loading: true,
            error: 'test error',
          }
        });

        const result = authTransform.out(outboundState, 'auth', mockRootState);
        expect(result).toEqual({
          token: 'test-token',
          user: mockUser,
          loading: true,
          error: 'test error',
        });
      });

      it('should handle undefined outbound state', () => {
        const result = authTransform.out({} as StoredAuthState, 'auth', {} as RootState);
        expect(result).toEqual({
          token: null,
          user: null,
          loading: false,
          error: null,
        });
      });

      it('should ignore states not in whitelist', () => {
        const otherState = { data: 'test' };
        const result = authTransform.in(otherState as any, 'other', {} as RootState);
        expect(result).toEqual(otherState);
      });
    });
  });

  describe('migrate', () => {
    const config = createPersistConfig<RootState>('test');
    const migrate = config.migrate as PersistMigrate;

    it('should handle undefined state', async () => {
      const result = await migrate(undefined, 0);
      expect(result).toEqual({
        _persist: { version: 0, rehydrated: true },
      });
    });

    it('should handle state without _persist', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        permissions: []
      };

      const state = {
        auth: {
          token: 'test-token',
          user: mockUser,
        },
      } as unknown as PersistedState;

      const result = await migrate(state, 0);
      expect(result).toEqual({
        ...state,
        _persist: { version: 0, rehydrated: true },
      });
    });

    it('should handle state with _persist', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        permissions: []
      };

      const state = {
        auth: {
          token: 'test-token',
          user: mockUser,
        },
        _persist: { version: 0, rehydrated: false },
      } as PersistedState;

      const result = await migrate(state, 0);
      expect(result).toEqual({
        ...state,
        _persist: { version: 0, rehydrated: true },
      });
    });
  });

  describe('stateReconciler', () => {
    const config = createPersistConfig<RootState>('test');
    const reconciler = config.stateReconciler as StateReconciler<RootState>;

    it('should merge inbound and reduced state', () => {
      const inboundState = { a: 1, b: 2 } as unknown as RootState;
      const originalState = {} as RootState;
      const reducedState = { b: 3, c: 4 } as unknown as RootState;
      const mockConfig = { debug: true } as PersistConfig<RootState>;

      const result = reconciler(inboundState, originalState, reducedState, mockConfig);
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 4,
      });
    });

    it('should handle empty states', () => {
      const mockConfig = { debug: true } as PersistConfig<RootState>;
      const result = reconciler({} as RootState, {} as RootState, {} as RootState, mockConfig);
      expect(result).toEqual({});
    });
  });
}); 