import { Action as ReduxAction, AnyAction } from '@reduxjs/toolkit';

// 基础 Action 类型
export interface BaseAction extends AnyAction {
  type: string;
  payload?: unknown;
  error?: {
    message?: string;
    [key: string]: unknown;
  };
  meta?: Record<string, unknown>;
}

// 泛型 Action 类型
export interface TypedAction<T = unknown> extends BaseAction {
  payload: T;
}

// 错误 Action 类型
export interface ErrorAction extends BaseAction {
  error: {
    message: string;
    [key: string]: unknown;
  };
}

// Action 类型守卫
export const isErrorAction = (action: unknown): action is ErrorAction => {
  return typeof action === 'object' && action !== null && 'error' in action;
}; 