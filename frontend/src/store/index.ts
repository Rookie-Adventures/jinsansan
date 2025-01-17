import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { loggerMiddleware } from './middleware/logger';
import { errorMiddleware } from './middleware/error';
import { performanceMiddleware } from './middleware/performance';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import errorReducer from './slices/error';

// 合并 reducers
const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  error: errorReducer,
});

// 配置持久化
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // 只持久化 auth reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建自定义中间件数组
const customMiddleware = [
  errorMiddleware,
  ...(process.env.NODE_ENV !== 'production' ? [loggerMiddleware, performanceMiddleware] : []),
];

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(customMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 导出 selectors
export * from './selectors/auth';
export * from './selectors/app'; 