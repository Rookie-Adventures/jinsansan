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

// 创建一个测试工具类来管理所有异步操作
class TestHelper {
  store: ReturnType<typeof createTestStore>;
  
  constructor(initialState = {}) {
    this.store = createTestStore(initialState);
  }

  // 等待组件渲染和状态更新
  async waitForComponentUpdate() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);  // 等待 React 状态更新
      await vi.advanceTimersByTimeAsync(0);  // 等待 useEffect 执行
    });
  }

  // 等待进度更新
  async waitForProgress() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);  // 等待进度更新定时器
    });
  }

  // 等待动画完成
  async waitForAnimation() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);  // 等待动画完成
    });
  }
}

const renderWithProviders = (ui: React.ReactElement, initialState = {}) => {
  const helper = new TestHelper(initialState);
  
  const view = render(
    <Provider store={helper.store}>
      <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
        {ui}
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
    renderWithProviders(<LoadingBar />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('加载状态下应该显示进度条', async () => {
    const { helper } = renderWithProviders(<LoadingBar />, {
      app: { 
        darkMode: false,
        loading: true,
        toast: {
          open: false,
          message: '',
          severity: 'info',
        }
      }
    });

    // 等待组件完全更新
    await helper.waitForComponentUpdate();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('进度值应该随时间增加', async () => {
    const { helper } = renderWithProviders(<LoadingBar />, {
      app: { 
        darkMode: false,
        loading: true,
        toast: {
          open: false,
          message: '',
          severity: 'info',
        }
      }
    });

    // 等待组件完全更新
    await helper.waitForComponentUpdate();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();

    // 等待进度更新
    await helper.waitForProgress();

    const newValue = Number(progressBar.getAttribute('aria-valuenow'));
    expect(newValue).toBeGreaterThan(0);
    expect(newValue).toBeLessThanOrEqual(90);
  });

  it('加载完成后应该显示 100% 并淡出', async () => {
    const { helper } = renderWithProviders(<LoadingBar />, {
      app: { 
        darkMode: false,
        loading: true,
        toast: {
          open: false,
          message: '',
          severity: 'info',
        }
      }
    });

    // 等待组件完全更新
    await helper.waitForComponentUpdate();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();

    // 切换到非加载状态
    await act(async () => {
      helper.store.dispatch({ type: 'app/setLoading', payload: false });
    });
    await helper.waitForComponentUpdate();

    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');

    // 等待淡出动画
    await helper.waitForAnimation();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
