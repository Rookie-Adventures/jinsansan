import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import appReducer from '../../../../store/slices/appSlice';
import { useAuth } from '@/hooks/auth';
import { errorLogger } from '@/utils/http/error/logger';
import { useMediaQuery } from '@mui/material';

// Mock useAuth hook
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn()
}));

// Mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false), // 默认为桌面视图
    useTheme: () => ({
      breakpoints: {
        down: () => false
      },
      palette: {
        text: {
          primary: '#000'
        }
      }
    })
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock errorLogger
vi.mock('@/utils/http/error/logger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

// Mock HttpError and HttpErrorType
vi.mock('@/utils/http/error/types', async () => {
  const HttpErrorType = {
    AUTH: 'AUTH_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    HTTP_ERROR: 'HTTP_ERROR',
    REACT_ERROR: 'REACT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  class HttpError extends Error {
    constructor(params: any) {
      super(params.message);
      Object.assign(this, params);
    }
  }

  return {
    HttpError,
    HttpErrorType
  };
});

describe('Navbar', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        app: appReducer
      }
    });
  };

  const renderNavbar = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 默认未登录状态
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      loading: false,
      error: null,
      token: null,
      getCurrentUser: vi.fn()
    });
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
      
      fireEvent.click(screen.getByRole('button', { name: '文档' }));
      expect(mockNavigate).toHaveBeenCalledWith('/docs');
      
      fireEvent.click(screen.getByRole('button', { name: 'API' }));
      expect(mockNavigate).toHaveBeenCalledWith('/api');
      
      fireEvent.click(screen.getByRole('button', { name: '价格' }));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });

    it('点击登录按钮应该跳转到登录页面', () => {
      renderNavbar();
      
      fireEvent.click(screen.getByRole('button', { name: '登录' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('用户认证状态', () => {
    it('已登录状态应该显示用户菜单', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });

      renderNavbar();
      
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('退出登录')).toBeInTheDocument();
    });

    it('点击退出登录应该调用 logout', async () => {
      const mockLogout = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });

      renderNavbar();
      
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      const logoutButton = screen.getByText('退出登录');
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('错误处理', () => {
    it('退出登录失败时应该记录错误', async () => {
      const mockError = new Error('退出登录失败');
      const mockLogout = vi.fn().mockRejectedValue(mockError);
      const mockErrorLog = vi.fn();
      
      // Mock errorLogger
      vi.mocked(errorLogger.log).mockImplementation(mockErrorLog);
      
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });

      renderNavbar();
      
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      const logoutButton = screen.getByText('退出登录');
      await fireEvent.click(logoutButton);
      
      // 等待 Promise 拒绝后的错误处理
      await vi.waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(errorLogger.log).toHaveBeenCalledWith(expect.objectContaining({
          type: 'AUTH_ERROR',
          message: '退出登录失败',
          data: mockError
        }));
      });
    });
  });

  describe('移动端视图', () => {
    beforeEach(() => {
      // Mock useMediaQuery 返回 true 表示移动端
      vi.mocked(useMediaQuery).mockReturnValue(true);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('移动端应该显示菜单图标而不是导航链接', () => {
      renderNavbar();
      
      // 不应该显示导航链接
      expect(screen.queryByRole('button', { name: '首页' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '文档' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'API' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '价格' })).not.toBeInTheDocument();
      
      // 应该显示菜单图标
      expect(screen.getByLabelText('menu')).toBeInTheDocument();
    });

    it('移动端已登录状态应该显示用户头像', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });

      renderNavbar();
      
      expect(screen.getByLabelText('account of current user')).toBeInTheDocument();
      expect(screen.queryByLabelText('menu')).not.toBeInTheDocument();
    });

    it('移动端用户菜单应该正常工作', () => {
      const mockLogout = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });

      renderNavbar();
      
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('退出登录')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('退出登录'));
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('用户菜单操作', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: ['read:posts']
        },
        logout: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        loading: false,
        error: null,
        token: 'test-token',
        getCurrentUser: vi.fn()
      });
    });

    it('点击用户名应该关闭菜单', () => {
      renderNavbar();
      
      // 打开菜单
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      // 验证菜单已打开
      expect(screen.getByText('testuser')).toBeInTheDocument();
      
      // 点击用户名
      fireEvent.click(screen.getByText('testuser'));
      
      // 验证菜单已关闭
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('点击菜单外部应该关闭菜单', () => {
      renderNavbar();
      
      // 打开菜单
      const accountButton = screen.getByLabelText('account of current user');
      fireEvent.click(accountButton);
      
      // 验证菜单已打开
      expect(screen.getByText('testuser')).toBeInTheDocument();
      
      // 触发菜单关闭事件
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Escape' });
      
      // 验证菜单已关闭
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
}); 