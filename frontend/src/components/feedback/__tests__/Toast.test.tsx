import { ThemeProvider, createTheme, AlertColor } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect } from 'vitest';

import appReducer from '@/store/slices/appSlice';

import { Toast } from '../Toast';

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

describe('Toast', () => {
  it('初始状态下不应该显示任何消息', () => {
    renderWithProviders(<Toast />);
    const alert = screen.queryByRole('alert');
    expect(alert).toBeNull();
  });

  it('当 open 为 true 时应该显示消息', () => {
    const testMessage = '测试消息';
    renderWithProviders(<Toast />, {
      preloadedState: {
        toast: {
          open: true,
          message: testMessage,
          severity: 'info' as AlertColor,
        },
      },
    });
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(testMessage);
  });

  it('应该根据 severity 显示不同类型的提示', () => {
    const testMessage = '错误消息';
    renderWithProviders(<Toast />, {
      preloadedState: {
        toast: {
          open: true,
          message: testMessage,
          severity: 'error' as AlertColor,
        },
      },
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('点击关闭按钮应该触发 hideToast action', () => {
    const { store } = renderWithProviders(<Toast />, {
      preloadedState: {
        toast: {
          open: true,
          message: '测试消息',
          severity: 'info' as AlertColor,
        },
      },
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    const state = store.getState();
    expect(state.app.toast.open).toBe(false);
  });
});
