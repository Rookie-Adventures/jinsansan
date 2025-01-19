import { User } from '../auth';

// 根状态类型
export interface RootState {
  auth: AuthState;
  ui: UIState;
  app: AppState;
}

// 认证状态
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// UI状态
export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  modalStack: string[];
  loading: {
    [key: string]: boolean;
  };
}

// 应用状态
export interface AppState {
  initialized: boolean;
  version: string;
  environment: string;
  settings: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}

// Action类型
export interface Action<T = unknown> {
  type: string;
  payload?: T;
  error?: boolean;
  meta?: Record<string, unknown>;
}

// Thunk Action类型
export type ThunkAction<R = void, S = RootState> = (
  dispatch: Dispatch,
  getState: () => S
) => R;

// Dispatch类型
export type Dispatch = <T = unknown>(action: Action<T> | ThunkAction) => Promise<T> | T; 