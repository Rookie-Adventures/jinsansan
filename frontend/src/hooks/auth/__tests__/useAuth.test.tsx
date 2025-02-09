import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore, createAsyncThunk, AsyncThunkAction, PayloadAction } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../useAuth';
import authReducer, { login, register, logout, clearAuth } from '@/store/slices/authSlice';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';
import { errorLogger } from '@/utils/errorLogger';
import type { LoginFormData, RegisterFormData } from '@/types/auth';
import type { LoginResponse } from '@/services/auth';

// Mock redux store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock error logger
vi.mock('@/utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

// Mock HTTP error factory
vi.mock('@/utils/http/error/factory', () => ({
  HttpErrorFactory: {
    create: vi.fn().mockImplementation((err: any) => {
      if (err instanceof HttpError) {
        return err;
      }
      return new HttpError({
        type: HttpErrorType.AUTH,
        message: err.message || 'Unknown error',
        status: 401,
        data: err
      });
    })
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Redux actions
vi.mock('@/store/slices/authSlice', async () => {
  const actual = await vi.importActual('@/store/slices/authSlice');
  return {
    ...actual,
    login: vi.fn().mockImplementation((data: LoginFormData): AsyncThunkAction<LoginResponse, LoginFormData, {}> => {
      return {
        abort: vi.fn(),
        arg: data,
        requestId: 'test-id',
        signal: new AbortController().signal,
        unwrap: () => Promise.resolve({
          user: { id: 1, username: 'testuser', email: 'test@example.com', permissions: [] },
          token: 'test-token'
        }),
        match: vi.fn(),
        meta: {
          arg: data,
          requestId: 'test-id',
          requestStatus: 'pending'
        },
        payload: undefined,
        type: 'auth/login'
      } as any;
    }),
    register: vi.fn().mockImplementation((data: RegisterFormData): AsyncThunkAction<LoginResponse, RegisterFormData, {}> => {
      return {
        abort: vi.fn(),
        arg: data,
        requestId: 'test-id',
        signal: new AbortController().signal,
        unwrap: () => Promise.resolve({
          user: { id: 1, username: 'testuser', email: 'test@example.com', permissions: [] },
          token: 'test-token'
        }),
        match: vi.fn(),
        meta: {
          arg: data,
          requestId: 'test-id',
          requestStatus: 'pending'
        },
        payload: undefined,
        type: 'auth/register'
      } as any;
    }),
    logout: vi.fn().mockImplementation((): AsyncThunkAction<void, void, {}> => {
      return {
        abort: vi.fn(),
        arg: undefined,
        requestId: 'test-id',
        signal: new AbortController().signal,
        unwrap: () => Promise.resolve(),
        match: vi.fn(),
        meta: {
          arg: undefined,
          requestId: 'test-id',
          requestStatus: 'pending'
        },
        payload: undefined,
        type: 'auth/logout'
      } as any;
    }),
    clearAuth: vi.fn().mockReturnValue({
      type: 'auth/clearAuth'
    })
  };
});

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
        token: 'test-token'
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
        password: 'password123'
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
        data: { reason: 'Invalid credentials' }
      });
      
      vi.mocked(login).mockImplementation((data: LoginFormData): AsyncThunkAction<LoginResponse, LoginFormData, {}> => {
        return {
          abort: vi.fn(),
          arg: data,
          requestId: 'test-id',
          signal: new AbortController().signal,
          unwrap: () => Promise.reject(mockError),
          match: vi.fn(),
          meta: {
            arg: data,
            requestId: 'test-id',
            requestStatus: 'rejected'
          },
          payload: undefined,
          type: 'auth/login'
        } as any;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.login({
            username: 'testuser',
            password: 'wrong-password'
          });
        } catch (error) {
          // 预期的错误
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
        confirmPassword: 'password123'
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
        data: { reason: 'Username taken' }
      });
      
      vi.mocked(register).mockImplementation((data: RegisterFormData): AsyncThunkAction<LoginResponse, RegisterFormData, {}> => {
        return {
          abort: vi.fn(),
          arg: data,
          requestId: 'test-id',
          signal: new AbortController().signal,
          unwrap: () => Promise.reject(mockError),
          match: vi.fn(),
          meta: {
            arg: data,
            requestId: 'test-id',
            requestStatus: 'rejected'
          },
          payload: undefined,
          type: 'auth/register'
        } as any;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.register({
            username: 'testuser',
            password: 'password123',
            email: 'test@example.com',
            confirmPassword: 'password123'
          });
        } catch (error) {
          // 预期的错误
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
      vi.mocked(logout).mockImplementation((): AsyncThunkAction<void, void, {}> => {
        return {
          abort: vi.fn(),
          arg: undefined,
          requestId: 'test-id',
          signal: new AbortController().signal,
          unwrap: () => Promise.reject(mockError),
          match: vi.fn(),
          meta: {
            arg: undefined,
            requestId: 'test-id',
            requestStatus: 'rejected'
          },
          payload: undefined,
          type: 'auth/logout'
        } as any;
      });

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
        token: 'test-token'
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
        data: { reason: 'Token expired' }
      });
      
      vi.mocked(HttpErrorFactory.create).mockReturnValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: customWrapper });
      
      await expect(result.current.getCurrentUser()).rejects.toThrow();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 