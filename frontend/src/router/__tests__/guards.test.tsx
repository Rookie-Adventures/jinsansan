import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { vi } from 'vitest';

import authReducer from '@/store/slices/authSlice';

import { AuthGuard, GuestGuard } from '../guards';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
    Navigate: vi.fn().mockImplementation(({ to }) => (
      <div data-testid="location-display">{to}</div>
    ))
  };
});

// 测试用组件
const TestComponent = () => <div>Test Content</div>;

describe('Router Guards', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          token: null,
          user: null,
          loading: false,
          error: null,
          ...initialState,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 useLocation 的默认行为
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/login',
      search: '',
      hash: '',
      key: 'default',
      state: null
    });
  });

  describe('AuthGuard', () => {
    it('应该在未认证时重定向到登录页面', () => {
      const store = createTestStore();

      render(
        <Provider store={store}>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </Provider>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
    });

    it('应该在认证后显示受保护的内容', () => {
      const store = createTestStore({ token: 'test-token' });

      render(
        <Provider store={store}>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </Provider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('应该在重定向时保存原始路径', () => {
      const store = createTestStore();
      const mockLocation = {
        pathname: '/dashboard',
        search: '',
        hash: '',
        key: 'default',
        state: null
      };

      vi.mocked(useLocation).mockReturnValue(mockLocation);

      render(
        <Provider store={store}>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </Provider>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
    });
  });

  describe('GuestGuard', () => {
    it('应该在未认证时显示内容', () => {
      const store = createTestStore();

      render(
        <Provider store={store}>
          <GuestGuard>
            <TestComponent />
          </GuestGuard>
        </Provider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('应该在已认证时重定向到首页', () => {
      const store = createTestStore({ token: 'test-token' });

      render(
        <Provider store={store}>
          <GuestGuard>
            <TestComponent />
          </GuestGuard>
        </Provider>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });

    it('应该在已认证时重定向到之前的路径', () => {
      const store = createTestStore({ token: 'test-token' });
      const mockLocation = {
        pathname: '/login',
        search: '',
        hash: '',
        key: 'default',
        state: {
          from: {
            pathname: '/dashboard'
          }
        }
      };

      vi.mocked(useLocation).mockReturnValue(mockLocation);

      render(
        <Provider store={store}>
          <GuestGuard>
            <TestComponent />
          </GuestGuard>
        </Provider>
      );

      expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard');
    });
  });
}); 