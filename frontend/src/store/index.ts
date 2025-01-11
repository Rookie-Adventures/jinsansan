import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import { createPersistConfig } from './persistConfig';
import type { AppState } from './slices/appSlice';
import appReducer from './slices/appSlice';
import type { AuthState } from './slices/authSlice';
import authReducer from './slices/authSlice';
import type { RootState } from './types';

// 创建持久化 reducer
const persistedAppReducer = persistReducer<AppState>(
  createPersistConfig<AppState>('app'),
  appReducer
);

const persistedAuthReducer = persistReducer<AuthState>(
  createPersistConfig<AuthState>('auth'),
  authReducer
);

const persistedReducer = {
  app: persistedAppReducer,
  auth: persistedAuthReducer,
} as const;

// 创建自定义错误处理中间件
const errorMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    throw err;
  }
};

// 创建 store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });

    // 开发环境添加 logger
    if (process.env.NODE_ENV !== 'production') {
      middleware.push(createLogger({
        collapsed: true,
        duration: true,
      }));
    }

    // 添加错误处理中间件
    middleware.push(errorMiddleware);

    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// 导出 dispatch 类型
export type AppDispatch = typeof store.dispatch;

// 创建类型化的hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 