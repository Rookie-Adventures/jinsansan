import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect } from 'vitest';
import MainLayout from '../MainLayout';
import appReducer, { AppState } from '../../../../store/slices/appSlice';
import type { AlertColor } from '@mui/material';

// 测试配置
const TEST_NAVBAR_TEXT = 'Navbar';
const TEST_OUTLET_TEXT = 'Outlet Content';

// 测试类型定义
interface TestStoreOptions {
  initialState?: Partial<AppState>;
}

// Mock Navbar 组件
vi.mock('../Navbar', () => ({
  default: () => <div data-testid="mock-navbar">{TEST_NAVBAR_TEXT}</div>
}));

// Mock Outlet 组件
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">{TEST_OUTLET_TEXT}</div>
  };
});

describe('MainLayout', () => {
  const createTestStore = ({ initialState }: TestStoreOptions = {}) => {
    return configureStore({
      reducer: {
        app: appReducer
      },
      preloadedState: initialState ? {
        app: {
          darkMode: false,
          loading: false,
          toast: {
            open: false,
            message: '',
            severity: 'info' as AlertColor
          },
          ...initialState
        }
      } : undefined
    });
  };

  const renderWithProviders = (ui: React.ReactElement, options: TestStoreOptions = {}) => {
    const store = createTestStore(options);
    return {
      ...render(
        <Provider store={store}>
          <MemoryRouter>
            {ui}
          </MemoryRouter>
        </Provider>
      ),
      store
    };
  };

  it('应该正确渲染导航栏和主内容区域', () => {
    renderWithProviders(<MainLayout />);

    // 验证导航栏是否渲染
    const navbar = screen.getByTestId('mock-navbar');
    expect(navbar).toBeInTheDocument();
    expect(navbar).toHaveTextContent(TEST_NAVBAR_TEXT);
    
    // 验证主内容区域是否渲染
    const outlet = screen.getByTestId('mock-outlet');
    expect(outlet).toBeInTheDocument();
    expect(outlet).toHaveTextContent(TEST_OUTLET_TEXT);
  });

  it('应该应用正确的样式', () => {
    renderWithProviders(<MainLayout />);

    // 验证根容器样式
    const rootContainer = screen.getByTestId('mock-outlet').parentElement?.parentElement;
    expect(rootContainer).toHaveStyle({
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    });

    // 验证主内容区域样式
    const mainContent = screen.getByTestId('mock-outlet').parentElement;
    expect(mainContent).toHaveStyle({
      flexGrow: 1,
      width: '100%',
      position: 'relative'
    });
  });
}); 