import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../types';

// 基础选择器
export const selectApp = (state: RootState) => state.app;

// Memoized 选择器
export const selectDarkMode = createSelector(selectApp, app => app.darkMode);

export const selectAppLoading = createSelector(selectApp, app => app.loading);

export const selectToast = createSelector(selectApp, app => app.toast);

// 复合选择器
export const selectIsToastVisible = createSelector(selectToast, toast => toast.open);

export const selectToastMessage = createSelector(selectToast, toast => ({
  message: toast.message,
  severity: toast.severity,
}));
