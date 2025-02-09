import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import appReducer, { AppState } from '../../../store/slices/appSlice';
import type { RootState } from '../../../store/types';
import type { AlertColor } from '@mui/material';

// 测试配置
const TEST_TIMEOUT = 1000;

interface TestWrapperProps {
  initialState?: Partial<AppState>;
  children: React.ReactNode;
}

// 创建测试用的 store
const createTestStore = (initialState: Partial<AppState> = { darkMode: false }) => {
  const store = configureStore({
    reducer: {
      app: appReducer
    },
    preloadedState: {
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
    }
  });

  return store;
};

// 测试包装组件
const TestWrapper: React.FC<TestWrapperProps> = ({ initialState, children }) => {
  const store = createTestStore(initialState);
  return <Provider store={store}>{children}</Provider>;
};

describe('ThemeToggle', () => {
  describe('基础渲染', () => {
    it('应该正确渲染亮色模式的图标', () => {
      render(
        <TestWrapper initialState={{ darkMode: false }}>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '切换到暗色模式');
      expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
    });

    it('应该正确渲染暗色模式的图标', () => {
      render(
        <TestWrapper initialState={{ darkMode: true }}>
          <ThemeToggle />
        </TestWrapper>
      );

      expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();
    });

    it('应该显示正确的工具提示文本', async () => {
      render(
        <TestWrapper initialState={{ darkMode: false }}>
          <ThemeToggle />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      const tooltip = await screen.findByText('切换到暗色模式', {}, { timeout: TEST_TIMEOUT });
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('点击时应该切换主题模式', () => {
      const store = createTestStore({ darkMode: false });
      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const state = store.getState() as RootState;
      expect(state.app.darkMode).toBe(true);
      expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();
    });

    it('应该在主题切换后更新工具提示文本', async () => {
      const store = createTestStore({ darkMode: false });
      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.mouseEnter(button);

      const tooltip = await screen.findByText('切换到亮色模式', {}, { timeout: TEST_TIMEOUT });
      expect(tooltip).toBeInTheDocument();
    });
  });
}); 