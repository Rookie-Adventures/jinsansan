import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { User, RegisterFormData } from '@/types/auth';

import { authApi } from '@/services/auth';

import authReducer, {
  login,
  register,
  getCurrentUser,
  logout,
  clearError,
  clearAuth,
  type AuthState,
} from '../authSlice';

// Mock auth service
vi.mock('@/services/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore<{ auth: AuthState }>>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      const state = store.getState();
      expect(state.auth).toEqual({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });

    it('should handle clearError', () => {
      store.dispatch(clearError());
      const state = store.getState();
      expect(state.auth.error).toBeNull();
    });

    it('should handle clearAuth', () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        permissions: ['user'],
      };

      const initialState: AuthState = {
        user: mockUser,
        token: 'test-token',
        loading: true,
        error: 'test error',
      };

      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: initialState },
      });

      store.dispatch(clearAuth());
      const state = store.getState();
      expect(state.auth).toEqual({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('async actions', () => {
    describe('login', () => {
      const mockLoginData = {
        loginMethod: 'username' as const,
        username: 'test',
        password: 'password'
      };
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        permissions: ['user'],
      };
      const mockLoginResponse = {
        user: mockUser,
        token: 'test-token',
      };

      it('should handle login.pending', async () => {
        vi.mocked(authApi.login).mockImplementation(() => new Promise(() => {}));
        const promise = store.dispatch(login(mockLoginData));
        const state = store.getState();
        expect(state.auth.loading).toBe(true);
        expect(state.auth.error).toBeNull();
        await promise.abort();
      });

      it('should handle login.fulfilled', async () => {
        vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);
        await store.dispatch(login(mockLoginData));
        const state = store.getState();
        expect(state.auth).toEqual({
          user: mockLoginResponse.user,
          token: mockLoginResponse.token,
          loading: false,
          error: null,
        });
      });

      it('should handle login.rejected', async () => {
        const errorMessage = '登录失败';
        vi.mocked(authApi.login).mockRejectedValue(new Error(errorMessage));
        await store.dispatch(login(mockLoginData));
        const state = store.getState();
        expect(state.auth).toEqual({
          user: null,
          token: null,
          loading: false,
          error: errorMessage,
        });
      });
    });

    describe('register', () => {
      const mockRegisterData: RegisterFormData = {
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        confirmPassword: 'password',
      };
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        permissions: ['user'],
      };
      const mockRegisterResponse = {
        user: mockUser,
        token: 'test-token',
      };

      it('should handle register.pending', async () => {
        vi.mocked(authApi.register).mockImplementation(() => new Promise(() => {}));
        const promise = store.dispatch(register(mockRegisterData));
        const state = store.getState();
        expect(state.auth.loading).toBe(true);
        expect(state.auth.error).toBeNull();
        await promise.abort();
      });

      it('should handle register.fulfilled', async () => {
        vi.mocked(authApi.register).mockResolvedValue(mockRegisterResponse);
        await store.dispatch(register(mockRegisterData));
        const state = store.getState();
        expect(state.auth).toEqual({
          user: mockRegisterResponse.user,
          token: mockRegisterResponse.token,
          loading: false,
          error: null,
        });
      });

      it('should handle register.rejected', async () => {
        const errorMessage = '注册失败';
        vi.mocked(authApi.register).mockRejectedValue(new Error(errorMessage));
        await store.dispatch(register(mockRegisterData));
        const state = store.getState();
        expect(state.auth).toEqual({
          user: null,
          token: null,
          loading: false,
          error: errorMessage,
        });
      });
    });

    describe('getCurrentUser', () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        permissions: ['user'],
      };

      it('should handle getCurrentUser.fulfilled', async () => {
        vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);
        await store.dispatch(getCurrentUser());
        const state = store.getState();
        expect(state.auth.user).toEqual(mockUser);
      });

      it('should handle getCurrentUser.rejected', async () => {
        vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error());
        await store.dispatch(getCurrentUser());
        const state = store.getState();
        expect(state.auth).toEqual({
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      });
    });

    describe('logout', () => {
      beforeEach(() => {
        const mockUser: User = {
          id: 1,
          username: 'test',
          email: 'test@test.com',
          permissions: ['user'],
        };

        // 设置初始登录状态
        store = configureStore({
          reducer: { auth: authReducer },
          preloadedState: {
            auth: {
              user: mockUser,
              token: 'test-token',
              loading: false,
              error: null,
            },
          },
        });
      });

      it('should handle logout.pending', async () => {
        vi.mocked(authApi.logout).mockImplementation(() => new Promise(() => {}));
        const promise = store.dispatch(logout());
        const state = store.getState();
        expect(state.auth.loading).toBe(true);
        expect(state.auth.error).toBeNull();
        await promise.abort();
      });

      it('should handle logout.fulfilled', async () => {
        vi.mocked(authApi.logout).mockResolvedValue(undefined);
        await store.dispatch(logout());
        const state = store.getState();
        expect(state.auth).toEqual({
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      });

      it('should handle logout.rejected', async () => {
        const errorMessage = '退出登录失败';
        vi.mocked(authApi.logout).mockRejectedValue(new Error(errorMessage));
        await store.dispatch(logout());
        const state = store.getState();
        expect(state.auth).toEqual({
          user: null,
          token: null,
          loading: false,
          error: errorMessage,
        });
      });
    });
  });
}); 