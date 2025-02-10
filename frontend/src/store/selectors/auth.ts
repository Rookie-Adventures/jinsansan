import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../types';

// 基础选择器
export const selectAuth = (state: RootState) => state.auth;

// Memoized 选择器
export const selectUser = createSelector(selectAuth, auth => auth.user);

export const selectIsAuthenticated = createSelector(selectAuth, auth => !!auth.token);

export const selectAuthLoading = createSelector(selectAuth, auth => auth.loading);

export const selectAuthError = createSelector(selectAuth, auth => auth.error);

// 复杂选择器
export const selectUserPermissions = createSelector(selectUser, user => user?.permissions || []);

export const selectIsAdmin = createSelector(selectUserPermissions, permissions =>
  permissions.includes('admin')
);
