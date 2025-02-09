import type { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createTransform } from 'redux-persist';
import { RootState } from './types';

// 转换函数
const authTransform = createTransform(
  // 保存时转换
  (inboundState: any) => {
    if (inboundState) {
      const { token, user } = inboundState;
      return { token, user: { id: user?.id, username: user?.username } };
    }
    return inboundState;
  },
  // 加载时转换
  (outboundState: any) => outboundState,
  { whitelist: ['auth'] }
);

const themeTransform = createTransform(
  // 保存时转换
  (inboundState: any) => {
    if (inboundState) {
      const { mode, customizations } = inboundState;
      return { mode, customizations };
    }
    return inboundState;
  },
  // 加载时转换
  (outboundState: any) => outboundState,
  { whitelist: ['theme'] }
);

// 迁移函数
const migrate = async (state: any, version: number) => {
  if (!state) return {};

  if (version === 0) {
    // 处理旧版本状态
    return {
      ...state,
      auth: state.auth ? {
        token: state.auth.token,
        user: state.auth.user ? {
          id: state.auth.user.id,
          username: state.auth.user.username
        } : null
      } : null
    };
  }
  return state;
};

// 状态合并函数
const stateReconciler = (inboundState: any, _originalState: any, reducedState: any, _config: any) => {
  return {
    ...reducedState,
    ...inboundState
  };
};

// 创建基础配置
export function createPersistConfig<T>(key: string): PersistConfig<T> {
  const debug = process.env.NODE_ENV !== 'production';
  
  return {
    key,
    storage,
    whitelist: ['auth', 'theme'],
    transforms: [authTransform, themeTransform],
    version: 1,
    migrate,
    stateReconciler,
    debug,
  };
}

// 导出默认的 persistConfig
export const persistConfig = createPersistConfig<RootState>('root'); 