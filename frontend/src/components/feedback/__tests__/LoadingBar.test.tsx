import { ThemeProvider, createTheme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import appReducer from '@/store/slices/appSlice';

import { LoadingBar } from '../LoadingBar';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState,
  });
};

const defaultAppState = {
  darkMode: false,
  loading: true,
  toast: {
    open: false,
    message: '',
    severity: 'info',
  }
};

// 创建一个测试工具类来管理所有异步操作
class TestHelper {
  store: ReturnType<typeof createTestStore>;
  
  constructor(initialState = {}) {
    this.store = createTestStore(initialState);
  }

  // 等待组件更新和动画
  async waitForUpdate(type: 'component' | 'progress' | 'animation') {
    const delays = {
      component: 0,  // React 状态更新
      progress: 500, // 进度更新定时器
      animation: 300, // 动画完成
    };

    await act(async () => {
      await vi.advanceTimersByTimeAsync(delays[type]);
    });
  }

  // 等待所有更新完成
  async waitForAll() {
    await this.waitForUpdate('component');
    await this.waitForUpdate('progress');
    await this.waitForUpdate('animation');
  }
}

const renderWithProviders = (initialState = {}) => {
  const helper = new TestHelper({
    app: {
      ...defaultAppState,
      ...initialState,
    },
  });
  
  const view = render(
    <Provider store={helper.store}>
      <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
        <LoadingBar />
      </ThemeProvider>
    </Provider>
  );

  return {
    ...view,
    helper,
  };
};

describe('LoadingBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态下不应该显示进度条', () => {
    renderWithProviders({ loading: false });
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('加载状态下应该显示进度条', async () => {
    const { helper } = renderWithProviders();
    await helper.waitForUpdate('component');
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('进度值应该随时间增加', async () => {
    const { helper } = renderWithProviders();
    await helper.waitForUpdate('component');
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();

    await helper.waitForUpdate('progress');

    const newValue = Number(progressBar.getAttribute('aria-valuenow'));
    expect(newValue).toBeGreaterThan(0);
    expect(newValue).toBeLessThanOrEqual(90);
  });

  it('加载完成后应该显示 100% 并淡出', async () => {
    const { helper } = renderWithProviders();
    await helper.waitForUpdate('component');
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();

    // 切换到非加载状态
    await act(async () => {
      helper.store.dispatch({ type: 'app/setLoading', payload: false });
    });
    await helper.waitForAll();

    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
