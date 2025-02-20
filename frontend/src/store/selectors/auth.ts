import { createSelector } from '@reduxjs/toolkit';

import type { AuthState } from '../slices/authSlice';
import type { RootState } from '../types';
import type { User } from '@/types/user';

// 基础选择器
export const selectAuth = (state: RootState): AuthState => state.auth;

// Memoized 选择器
export const selectUser = createSelector(selectAuth, (auth): User | null => auth.user);

export const selectIsAuthenticated = createSelector(selectAuth, (auth): boolean => !!auth.token);

export const selectAuthLoading = createSelector(selectAuth, (auth): boolean => auth.loading);

export const selectAuthError = createSelector(selectAuth, (auth): string | null => auth.error);

// 复杂选择器
export const selectUserPermissions = createSelector(
  selectUser,
  (user): string[] => user?.permissions || []
);

export const selectIsAdmin = createSelector(
  selectUserPermissions,
  (permissions): boolean => permissions.includes('admin')
);
