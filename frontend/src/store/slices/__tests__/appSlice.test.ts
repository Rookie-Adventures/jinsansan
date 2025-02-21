import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';

import type { AlertColor } from '@mui/material';

import appReducer, {
  toggleDarkMode,
  setLoading,
  showToast,
  hideToast,
  type AppState,
} from '../appSlice';

describe('appSlice', () => {
  let store: ReturnType<typeof configureStore<{ app: AppState }>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        app: appReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      const state = store.getState();
      expect(state.app).toEqual({
        darkMode: false,
        loading: false,
        toast: {
          open: false,
          message: '',
          severity: 'info' as AlertColor,
        },
      });
    });

    describe('toggleDarkMode', () => {
      it('should toggle dark mode from false to true', () => {
        store.dispatch(toggleDarkMode());
        const state = store.getState();
        expect(state.app.darkMode).toBe(true);
      });

      it('should toggle dark mode from true to false', () => {
        // 设置初始状态为 dark mode
        store = configureStore({
          reducer: { app: appReducer },
          preloadedState: {
            app: {
              darkMode: true,
              loading: false,
              toast: { open: false, message: '', severity: 'info' as AlertColor },
            },
          },
        });

        store.dispatch(toggleDarkMode());
        const state = store.getState();
        expect(state.app.darkMode).toBe(false);
      });
    });

    describe('setLoading', () => {
      it('should set loading to true', () => {
        store.dispatch(setLoading(true));
        const state = store.getState();
        expect(state.app.loading).toBe(true);
      });

      it('should set loading to false', () => {
        // 设置初始状态为 loading
        store = configureStore({
          reducer: { app: appReducer },
          preloadedState: {
            app: {
              darkMode: false,
              loading: true,
              toast: { open: false, message: '', severity: 'info' as AlertColor },
            },
          },
        });

        store.dispatch(setLoading(false));
        const state = store.getState();
        expect(state.app.loading).toBe(false);
      });
    });

    describe('toast', () => {
      it('should show success toast', () => {
        store.dispatch(
          showToast({
            message: 'Success message',
            severity: 'success' as AlertColor,
          })
        );
        const state = store.getState();
        expect(state.app.toast).toEqual({
          open: true,
          message: 'Success message',
          severity: 'success',
        });
      });

      it('should show error toast', () => {
        store.dispatch(
          showToast({
            message: 'Error message',
            severity: 'error' as AlertColor,
          })
        );
        const state = store.getState();
        expect(state.app.toast).toEqual({
          open: true,
          message: 'Error message',
          severity: 'error',
        });
      });

      it('should show warning toast', () => {
        store.dispatch(
          showToast({
            message: 'Warning message',
            severity: 'warning' as AlertColor,
          })
        );
        const state = store.getState();
        expect(state.app.toast).toEqual({
          open: true,
          message: 'Warning message',
          severity: 'warning',
        });
      });

      it('should show info toast', () => {
        store.dispatch(
          showToast({
            message: 'Info message',
            severity: 'info' as AlertColor,
          })
        );
        const state = store.getState();
        expect(state.app.toast).toEqual({
          open: true,
          message: 'Info message',
          severity: 'info',
        });
      });

      it('should hide toast', () => {
        // 先显示一个 toast
        store.dispatch(
          showToast({
            message: 'Test message',
            severity: 'info' as AlertColor,
          })
        );

        // 然后隐藏它
        store.dispatch(hideToast());
        const state = store.getState();
        expect(state.app.toast.open).toBe(false);
        // 确保其他属性保持不变
        expect(state.app.toast.message).toBe('Test message');
        expect(state.app.toast.severity).toBe('info');
      });

      it('should handle multiple toast operations', () => {
        // 显示第一个 toast
        store.dispatch(
          showToast({
            message: 'First message',
            severity: 'info' as AlertColor,
          })
        );

        // 隐藏 toast
        store.dispatch(hideToast());

        // 显示第二个 toast
        store.dispatch(
          showToast({
            message: 'Second message',
            severity: 'success' as AlertColor,
          })
        );

        const state = store.getState();
        expect(state.app.toast).toEqual({
          open: true,
          message: 'Second message',
          severity: 'success',
        });
      });
    });
  });
}); 