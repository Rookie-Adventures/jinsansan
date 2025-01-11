import type { compose } from '@reduxjs/toolkit';

import type { AppState } from './slices/appSlice';
import type { AuthState } from './slices/authSlice';

export interface RootState {
  app: AppState;
  auth: AuthState;
}

// 扩展 Window 接口以支持 Redux DevTools
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
} 