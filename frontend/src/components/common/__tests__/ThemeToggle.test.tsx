import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import appReducer, { AppState } from '../../../store/slices/appSlice';

// 创建测试用的 store
const createTestStore = (initialState: Partial<AppState> = { darkMode: false }) => {
  return configureStore({
    reducer: {
      app: appReducer
    },
    preloadedState: {
      app: initialState as AppState
    }
  });
};

describe('ThemeToggle', () => {
  describe('基础渲染', () => {
    it('应该正确渲染亮色模式的图标', () => {
      const store = createTestStore({ darkMode: false });
      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '切换到暗色模式');
      expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
    });

    it('应该正确渲染暗色模式的图标', () => {
      const store = createTestStore({ darkMode: true });
      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();
    });

    it('应该显示正确的工具提示文本', async () => {
      const store = createTestStore({ darkMode: false });
      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      expect(await screen.findByText('切换到暗色模式')).toBeInTheDocument();
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

      const state = store.getState() as { app: AppState };
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

      expect(await screen.findByText('切换到亮色模式')).toBeInTheDocument();
    });
  });
}); 