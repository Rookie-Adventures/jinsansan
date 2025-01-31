import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

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
  whitelist: ['auth', 'app'], // 持久化 auth 和 app reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建开发环境的 logger 中间件
const createDevMiddleware = () => {
  if (process.env.NODE_ENV === 'development') {
    const { createLogger } = require('redux-logger');
    return createLogger({
      collapsed: true,
      duration: true,
      timestamp: false,
      diff: true,
      colors: {
        title: () => '#139BFE',
        prevState: () => '#9E9E9E',
        action: () => '#149945',
        nextState: () => '#A47104',
        error: () => '#FF0000',
      },
    });
  }
  return null;
};

// 创建中间件数组
const getCustomMiddleware = () => {
  const middleware = [errorMiddleware];
  
  if (process.env.NODE_ENV !== 'production') {
    middleware.push(performanceMiddleware);
    const devLogger = createDevMiddleware();
    if (devLogger) {
      middleware.push(devLogger);
    }
  }
  
  return middleware;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(getCustomMiddleware()),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Rookie Adventures Store',
    trace: true,
    traceLimit: 25,
    actionsDenylist: ['@@redux-form'], // 使用新的属性名
    maxAge: 50,
  },
});

export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 导出 selectors
export * from './selectors/app';
export * from './selectors/auth';

