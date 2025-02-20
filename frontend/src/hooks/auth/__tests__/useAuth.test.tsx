import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

import authReducer, { login, register, logout } from '@/store/slices/authSlice';
import { errorLogger } from '@/utils/errorLogger';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';

import { useAuth } from '../useAuth';

// 测试类型定义
interface TestUser {
  id: number;
  username: string;
  email: string;
  permissions: string[];
}

interface TestAuthResponse {
  user: TestUser;
  token: string;
}

type AuthActionType = 'login' | 'register' | 'logout';

interface AuthMethods {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const authMethods: Record<AuthActionType, keyof AuthMethods> = {
  login: 'login',
  register: 'register',
  logout: 'logout',
} as const;

// 测试数据工厂
const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  permissions: [],
  ...overrides,
});

const createTestAuthResponse = (userOverrides: Partial<TestUser> = {}): TestAuthResponse => ({
  user: createTestUser(userOverrides),
  token: 'test-token',
});

// Mock 设置
const mockNavigate = vi.fn();
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/utils/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

vi.mock('@/utils/http/error/factory', () => ({
  HttpErrorFactory: {
    create: vi.fn().mockImplementation((err: unknown) => {
      if (err instanceof HttpError) return err;
      return new HttpError({
        type: HttpErrorType.AUTH,
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 401,
        data: err,
      });
    }),
  },
}));

vi.mock('@/store/slices/authSlice', () => ({
  __esModule: true,
  default: (state = {}) => state,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearAuth: vi.fn().mockReturnValue({ type: 'auth/clearAuth' }),
}));

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// 测试环境设置
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: { auth: authReducer },
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

const createWrapper = (store = createTestStore()) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

// 测试辅助函数
const setupAuthTest = (config: {
  initialState?: Partial<typeof authReducer>;
  actionType?: AuthActionType;
  isSuccess?: boolean;
  error?: Error;
}) => {
  const store = createTestStore(config.initialState);
  const wrapper = createWrapper(store);

  if (config.actionType) {
    const response = createTestAuthResponse();
    const mockFn = vi.mocked(
      config.actionType === 'login' ? login :
      config.actionType === 'register' ? register : 
      logout
    );

    if (config.isSuccess) {
      mockFn.mockImplementation(() => ({
        type: `auth/${config.actionType}/fulfilled`,
        payload: config.actionType === 'logout' ? undefined : response,
        unwrap: () => Promise.resolve(config.actionType === 'logout' ? undefined : response),
      }) as any);
    } else {
      mockFn.mockImplementation(() => ({
        type: `auth/${config.actionType}/rejected`,
        unwrap: () => Promise.reject(config.error || new HttpError({
          type: HttpErrorType.AUTH,
          message: `${config.actionType} failed`,
          status: 401,
          data: { reason: 'Authentication failed' },
        })),
      }) as any);
    }
  }

  return {
    store,
    wrapper,
    renderAuth: () => renderHook(() => useAuth(), { wrapper }),
  };
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('基础状态', () => {
    it('应该返回初始状态', () => {
      const { renderAuth } = setupAuthTest({});
      const { result } = renderAuth();

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBeFalsy();
    });

    it('当有token时应该显示已认证状态', () => {
      const { renderAuth } = setupAuthTest({
        initialState: { token: 'test-token' },
      });
      const { result } = renderAuth();

      expect(result.current.isAuthenticated).toBeTruthy();
    });
  });

  describe.each([
    ['login' as const, '登录', '/login'],
    ['register' as const, '注册', '/register'],
  ])('%s功能', (actionType, name, failPath) => {
    const testData = {
      login: { username: 'testuser', password: 'password123' } as const,
      register: {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123',
      } as const,
    };

    it(`${name}成功时应该跳转到首页`, async () => {
      const { renderAuth } = setupAuthTest({
        actionType,
        isSuccess: true,
      });
      const { result } = renderAuth();

      await act(async () => {
        const method = authMethods[actionType];
        if (method === 'login') {
          await result.current.login(testData.login);
        } else if (method === 'register') {
          await result.current.register(testData.register);
        }
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it(`${name}失败时应该跳转到${failPath}`, async () => {
      const { renderAuth } = setupAuthTest({
        actionType,
        isSuccess: false,
        error: new HttpError({
          type: HttpErrorType.AUTH,
          message: `${name}失败`,
          status: 401,
          data: { reason: '认证失败' },
        }),
      });
      const { result } = renderAuth();

      await act(async () => {
        try {
          const method = authMethods[actionType];
          if (method === 'login') {
            await result.current.login(testData.login);
          } else if (method === 'register') {
            await result.current.register(testData.register);
          }
        } catch (error) {
          expect(error).toBeInstanceOf(HttpError);
        }
      });

      expect(mockNavigate).toHaveBeenCalledWith(failPath);
    });
  });

  describe('登出功能', () => {
    it('登出成功时应该清除认证状态并跳转到首页', async () => {
      const { renderAuth } = setupAuthTest({
        actionType: 'logout',
        isSuccess: true,
        initialState: {
          token: 'test-token',
          user: createTestUser(),
        },
      });
      const { result } = renderAuth();

      await act(async () => {
        await result.current.logout();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('persist:root');
    });

    it('登出失败时应该记录错误并仍然清除认证状态', async () => {
      const error = new Error('退出登录失败');
      const { renderAuth } = setupAuthTest({
        actionType: 'logout',
        isSuccess: false,
        error,
        initialState: {
          token: 'test-token',
          user: createTestUser(),
        },
      });
      const { result } = renderAuth();

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
      const { renderAuth } = setupAuthTest({});
      const { result } = renderAuth();

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('获取用户失败时应该跳转到登录页', async () => {
      const { renderAuth } = setupAuthTest({
        initialState: { token: 'test-token' },
      });

      const mockError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Failed to get user',
        status: 401,
        data: { reason: 'Token expired' },
      });

      vi.mocked(HttpErrorFactory.create).mockReturnValue(mockError);
      const { result } = renderAuth();

      await expect(result.current.getCurrentUser()).rejects.toThrow();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
