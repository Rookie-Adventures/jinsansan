import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import MainLayout from '../MainLayout';
import appReducer from '../../../../store/slices/appSlice';

// Mock Navbar 组件
vi.mock('../Navbar', () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>
}));

// Mock Outlet 组件
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>
  };
});

describe('MainLayout', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        app: appReducer
      }
    });
  };

  it('应该正确渲染导航栏和主内容区域', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </Provider>
    );

    // 验证导航栏是否渲染
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    
    // 验证主内容区域是否渲染
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });

  it('应该应用正确的样式', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </Provider>
    );

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