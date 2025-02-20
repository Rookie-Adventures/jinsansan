import { createSelector } from '@reduxjs/toolkit';

import type { AppState } from '../slices/appSlice';
import type { RootState } from '../types';
import type { AlertColor } from '@mui/material';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// 基础选择器
export const selectApp = (state: RootState): AppState => state.app;

// Memoized 选择器
export const selectDarkMode = createSelector(selectApp, (app): boolean => app.darkMode);

export const selectAppLoading = createSelector(selectApp, (app): boolean => app.loading);

export const selectToast = createSelector(selectApp, (app): ToastState => app.toast);

// 复合选择器
export const selectIsToastVisible = createSelector(selectToast, (toast): boolean => toast.open);

export const selectToastMessage = createSelector(
  selectToast,
  (toast): Pick<ToastState, 'message' | 'severity'> => ({
    message: toast.message,
    severity: toast.severity,
  })
);
