import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material';
import { AlertColor } from '@mui/material';

import { LoadingBar } from '../LoadingBar';
import appReducer from '@/store/slices/appSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState: {
      app: {
        darkMode: false,
        loading: false,
        toast: {
          open: false,
          message: '',
          severity: 'info' as AlertColor,
        },
        ...preloadedState,
      },
    },
  });
};

const renderWithProviders = (ui: React.ReactElement, { preloadedState = {} } = {}) => {
  const store = createTestStore(preloadedState);
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>{ui}</ThemeProvider>
      </Provider>
    ),
    store,
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
    renderWithProviders(<LoadingBar />);
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).toBeNull();
  });

  it('加载状态下应该显示进度条', () => {
    renderWithProviders(<LoadingBar />, {
      preloadedState: { loading: true },
    });
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('进度值应该随时间增加', async () => {
    renderWithProviders(<LoadingBar />, {
      preloadedState: { loading: true },
    });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');

    // 等待一个 tick 让 useEffect 执行
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // 前进 500ms 触发进度更新
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    const newValue = Number(progressBar.getAttribute('aria-valuenow'));
    expect(newValue).toBeGreaterThan(0);
    expect(newValue).toBeLessThanOrEqual(90);
  });

  it('加载完成后应该显示 100% 并淡出', async () => {
    const { store } = renderWithProviders(<LoadingBar />, {
      preloadedState: { loading: true },
    });

    const progressBar = screen.getByRole('progressbar');

    // 等待一个 tick 让 useEffect 执行
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // 切换到非加载状态
    await act(async () => {
      store.dispatch({ type: 'app/setLoading', payload: false });
      // 等待状态更新
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');

    // 等待淡出动画
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
