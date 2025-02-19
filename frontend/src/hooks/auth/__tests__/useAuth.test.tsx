import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';


import authReducer, { login, register, logout } from '@/store/slices/authSlice';
import { errorLogger } from '@/utils/errorLogger';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';

import { useAuth } from '../useAuth';

// Mock redux store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: true,
      }),
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock error logger
vi.mock('@/utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// Mock HTTP error factory
vi.mock('@/utils/http/error/factory', () => ({
  HttpErrorFactory: {
    create: vi.fn().mockImplementation((err: unknown) => {
      if (err instanceof HttpError) {
        return err;
      }
      return new HttpError({
        type: HttpErrorType.AUTH,
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 401,
        data: err,
      });
    }),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock Redux actions
vi.mock('@/store/slices/authSlice', () => ({
  __esModule: true,
  default: (state = {}) => state,
  login: vi.fn().mockImplementation(_ => {
    return {
      type: 'auth/login/fulfilled',
      payload: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: [],
        },
        token: 'test-token',
      },
      unwrap: () =>
        Promise.resolve({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            permissions: [],
          },
          token: 'test-token',
        }),
    };
  }),
  register: vi.fn().mockImplementation(_ => {
    return {
      type: 'auth/register/fulfilled',
      payload: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: [],
        },
        token: 'test-token',
      },
      unwrap: () =>
        Promise.resolve({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            permissions: [],
          },
          token: 'test-token',
        }),
    };
  }),
  logout: vi.fn().mockImplementation(() => {
    return {
      type: 'auth/logout/fulfilled',
      unwrap: () => Promise.resolve(),
    };
  }),
  clearAuth: vi.fn().mockReturnValue({
    type: 'auth/clearAuth',
  }),
}));

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = createTestStore();
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('基础状态', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBeFalsy();
    });

    it('当有token时应该显示已认证状态', () => {
      const store = createTestStore({
        token: 'test-token',
      });

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
          <MemoryRouter>{children}</MemoryRouter>
        </Provider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper: customWrapper });

      expect(result.current.isAuthenticated).toBeTruthy();
    });
  });

  describe('登录功能', () => {
    it('登录成功时应该跳转到首页', async () => {
      const mockLoginData = {
        username: 'testuser',
        password: 'password123',
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(mockLoginData);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('登录失败时应该跳转到登录页', async () => {
      const mockError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Login failed',
        status: 401,
        data: { reason: 'Invalid credentials' },
      });

      vi.mocked(login).mockImplementation(() => {
        return {
          type: 'auth/login',
          unwrap: () => Promise.reject(mockError),
        } as any;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login({
            username: 'testuser',
            password: 'wrong-password',
          });
        } catch (_error) {
          expect(_error).toBe(mockError);
        }
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('注册功能', () => {
    it('注册成功时应该跳转到首页', async () => {
      const mockRegisterData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123',
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(mockRegisterData);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('注册失败时应该跳转到注册页', async () => {
      const mockError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Registration failed',
        status: 401,
        data: { reason: 'Username taken' },
      });

      // 直接使用 vi.mocked(register) 来模拟返回一个失败的 Promise
      vi.mocked(register).mockImplementation(() => ({
        type: 'auth/register/rejected',
        payload: mockError,
        unwrap: () => Promise.reject(mockError),
      } as any));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.register({
            username: 'testuser',
            password: 'password123',
            email: 'test@example.com',
            confirmPassword: 'password123',
          });
        } catch (_error) {
          // 验证捕获到的错误是预期的错误
          expect(_error).toBe(mockError);
        }
      });

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('登出功能', () => {
    it('登出成功时应该清除认证状态并跳转到首页', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('persist:root');
    });

    it('登出失败时应该记录错误并仍然清除认证状态', async () => {
      const mockError = new Error('退出登录失败');

      const mockLogoutAction = createAsyncThunk('auth/logout', async (): Promise<void> => {
        throw mockError;
      });

      vi.mocked(logout).mockImplementation(mockLogoutAction);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('persist:root');
      expect(errorLogger.log).toHaveBeenCalled();
    });
  });

  describe('获取当前用户', () => {
    it('没有token时不应该获取用户信息', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('获取用户失败时应该跳转到登录页', async () => {
      const store = createTestStore({
        token: 'test-token',
      });

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
          <MemoryRouter>{children}</MemoryRouter>
        </Provider>
      );

      const mockError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Failed to get user',
        status: 401,
        data: { reason: 'Token expired' },
      });

      vi.mocked(HttpErrorFactory.create).mockReturnValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: customWrapper });

      await expect(result.current.getCurrentUser()).rejects.toThrow();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
