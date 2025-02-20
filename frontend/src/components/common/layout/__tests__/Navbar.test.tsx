import { useMediaQuery } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import { vi } from 'vitest';

import { useAuth } from '@/hooks/auth';
import { clickAndWait, waitForAnimation } from '@/test/utils/muiTestHelpers';
import { errorLogger } from '@/utils/http/error/logger';

import appReducer from '../../../../store/slices/appSlice';
import authReducer from '../../../../store/slices/authSlice';
import Navbar from '../Navbar';

// Mock useAuth hook
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false), // 默认为桌面视图
    useTheme: () => ({
      breakpoints: {
        down: () => false,
      },
      palette: {
        text: {
          primary: '#000',
        },
      },
    }),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock errorLogger
vi.mock('@/utils/http/error/logger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// Mock HttpError and HttpErrorType
vi.mock('@/utils/http/error/types', async () => {
  const HttpErrorType = {
    AUTH: 'AUTH_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    HTTP_ERROR: 'HTTP_ERROR',
    REACT_ERROR: 'REACT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  };

  class HttpError extends Error {
    constructor(params: any) {
      super(params.message);
      Object.assign(this, params);
    }
  }

  return {
    HttpError,
    HttpErrorType,
  };
});

// 测试辅助函数和类型定义
interface TestUser {
  id: number;
  username: string;
  email: string;
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: TestUser | null;
  token: string | null;
  logout: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  getCurrentUser: () => Promise<void>;
}

const createTestUser = (): TestUser => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  permissions: ['read:posts'],
});

const createAuthState = (overrides: Partial<AuthState> = {}): ReturnType<typeof useAuth> => ({
  isAuthenticated: false,
  user: null,
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: null,
  token: null,
  getCurrentUser: vi.fn(),
  ...overrides,
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      app: appReducer,
      auth: authReducer,
      _persist: (state = { version: -1, rehydrated: true }) => state
    },
  });
};

const createRouter = () => {
  return createMemoryRouter(
    createRoutesFromElements(
      <Route path="*" element={<Navbar />} />
    ),
    {
      initialEntries: ['/'],
      future: {
        // @ts-expect-error React Router v7 future flags are not yet in the types
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );
};

const createTheme = () => ({
  // Implement your theme creation logic here
});

const renderNavbar = () => {
  const store = createTestStore();
  const router = createRouter();
  
  return render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme()}>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

const openUserMenu = async () => {
  const accountButton = screen.queryByLabelText('用户菜单');
  if (accountButton) {
    await clickAndWait(accountButton);
  } else {
    // 移动端菜单按钮
    const menuButton = screen.getByLabelText('menu');
    await clickAndWait(menuButton);
  }
};

// 扩展 FutureConfig 类型
declare module 'react-router-dom' {
  interface FutureConfig {
    v7_startTransition: boolean;
    v7_relativeSplatPath: boolean;
  }
}

describe('Navbar', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    user = userEvent.setup({ delay: null });
    vi.mocked(useAuth).mockReturnValue(createAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('基础渲染', () => {
    it('应该正确渲染导航栏', () => {
      renderNavbar();
      expect(screen.getByText('Jinsansan')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    });

    it('应该渲染所有导航链接', () => {
      renderNavbar();
      expect(screen.getByRole('button', { name: '首页' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '文档' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'API' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '价格' })).toBeInTheDocument();
    });
  });

  describe('导航功能', () => {
    it('点击导航链接应该正确跳转', () => {
      renderNavbar();

      const navigationLinks = [
        { name: '文档', path: '/docs' },
        { name: 'API', path: '/api' },
        { name: '价格', path: '/pricing' },
      ];

      navigationLinks.forEach(({ name, path }) => {
        fireEvent.click(screen.getByRole('button', { name }));
        expect(mockNavigate).toHaveBeenCalledWith(path);
      });
    });

    it('点击登录按钮应该跳转到登录页面', () => {
      renderNavbar();
      fireEvent.click(screen.getByRole('button', { name: '登录' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('用户认证状态', () => {
    beforeEach(() => {
      const testUser = createTestUser();
      vi.mocked(useAuth).mockReturnValue(createAuthState({
        isAuthenticated: true,
        user: testUser,
        token: 'test-token',
      }));
    });

    it('已登录状态应该显示用户菜单', async () => {
      renderNavbar();
      
      // 桌面端应该显示用户头像按钮
      const accountButton = screen.getByLabelText('用户菜单');
      expect(accountButton).toBeInTheDocument();
      
      await clickAndWait(accountButton);
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('退出登录')).toBeInTheDocument();
    });

    it('点击退出登录应该调用 logout', async () => {
      const mockLogout = vi.fn();
      vi.mocked(useAuth).mockReturnValue(createAuthState({
        isAuthenticated: true,
        user: createTestUser(),
        token: 'test-token',
        logout: mockLogout,
      }));

      renderNavbar();
      await openUserMenu();
      
      const logoutButton = screen.getByText('退出登录');
      await clickAndWait(logoutButton);
      
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('退出登录失败时应该记录错误', async () => {
      const mockError = new Error('退出登录失败');
      const mockLogout = vi.fn().mockRejectedValue(mockError);
      const mockErrorLog = vi.fn();

      vi.mocked(errorLogger.log).mockImplementation(mockErrorLog);
      vi.mocked(useAuth).mockReturnValue(createAuthState({
        isAuthenticated: true,
        user: createTestUser(),
        token: 'test-token',
        logout: mockLogout,
      }));

      renderNavbar();
      await openUserMenu();

      const logoutButton = screen.getByText('退出登录');
      await clickAndWait(logoutButton);

      await vi.waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(errorLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'AUTH_ERROR',
            message: '退出登录失败',
          })
        );
      });
    });
  });

  describe('移动端视图', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true);
    });

    it('移动端未登录状态应该显示菜单图标和移动端菜单', async () => {
      renderNavbar();
      
      const menuButton = screen.getByLabelText('menu');
      expect(menuButton).toBeInTheDocument();
      
      await clickAndWait(menuButton);
      
      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('文档')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('价格')).toBeInTheDocument();
      expect(screen.getByText('登录')).toBeInTheDocument();
      
      expect(screen.queryByRole('button', { name: '文档' })).not.toBeInTheDocument();
    });

    it('移动端已登录状态应该显示用户头像和用户菜单', async () => {
      const testUser = createTestUser();
      vi.mocked(useAuth).mockReturnValue(createAuthState({
        isAuthenticated: true,
        user: testUser,
        token: 'test-token',
      }));

      renderNavbar();
      
      const accountButton = await screen.findByLabelText('用户菜单');
      expect(accountButton).toBeInTheDocument();
      
      expect(screen.queryByLabelText('menu')).not.toBeInTheDocument();
      
      await clickAndWait(accountButton);
      
      expect(screen.getByText(testUser.username)).toBeInTheDocument();
      expect(screen.getByText('退出登录')).toBeInTheDocument();
    });

    it('移动端菜单项点击应该正确导航', async () => {
      renderNavbar();
      
      await clickAndWait(screen.getByLabelText('menu'));
      
      const menuItem = screen.getByRole('menuitem', { name: '文档', hidden: true });
      await clickAndWait(menuItem);
      
      expect(mockNavigate).toHaveBeenCalledWith('/docs');
    });

    it('点击移动端菜单外部应该关闭菜单', async () => {
      renderNavbar();
      
      await clickAndWait(screen.getByLabelText('menu'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '文档', hidden: true })).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      await waitForAnimation();
      
      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: '文档', hidden: true })).not.toBeInTheDocument();
      });
    });
  });

  describe('用户菜单操作', () => {
    beforeEach(() => {
      const testUser = createTestUser();
      vi.mocked(useAuth).mockReturnValue(createAuthState({
        isAuthenticated: true,
        user: testUser,
        token: 'test-token',
      }));
    });

    it('点击用户名应该关闭菜单', async () => {
      renderNavbar();
      
      await user.click(screen.getByLabelText('用户菜单'));
      vi.advanceTimersByTime(100);
      
      await user.click(screen.getByText('testuser'));
      vi.advanceTimersByTime(100);
      
      expect(screen.queryByText('退出登录')).not.toBeInTheDocument();
    });

    it('点击菜单外部应该关闭菜单', async () => {
      renderNavbar();
      
      // 打开用户菜单
      await user.click(screen.getByLabelText('用户菜单'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: '退出登录', hidden: true })).toBeInTheDocument();
      });
      
      // 按 ESC 键关闭菜单
      await user.keyboard('{Escape}');
      
      // 确认菜单已关闭
      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: '退出登录', hidden: true })).not.toBeInTheDocument();
      });
    });
  });
});
