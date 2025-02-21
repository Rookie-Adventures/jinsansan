import { createTransform, type PersistConfig, type StateReconciler, type PersistMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import type { RootState } from './types';
import type { AuthState } from '@/types/auth';
import type { User } from '@/types/user';

type StoredAuthState = Pick<AuthState, 'token' | 'user'>;

// Auth 转换函数
const authTransform = createTransform<AuthState, StoredAuthState>(
  // 保存时转换
  (inboundState) => {
    if (!inboundState || !inboundState.token) {
      return {} as StoredAuthState;
    }
    const { token, user } = inboundState;
    if (!user) {
      return { token, user: null };
    }
    // 只保留 User 类型中定义的属性
    const cleanUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      permissions: user.permissions || []
    };
    return {
      token,
      user: cleanUser
    };
  },
  // 加载时转换
  (outboundState, _key, fullState) => {
    const defaultState: AuthState = {
      token: null,
      user: null,
      loading: false,
      error: null,
    };

    if (!outboundState || !outboundState.token) {
      return defaultState;
    }

    const currentState = (fullState as RootState)?.auth || defaultState;
    
    return {
      ...outboundState,
      loading: currentState.loading ?? false,
      error: currentState.error ?? null,
    };
  },
  { whitelist: ['auth'] }
);

// 迁移函数
const migrate: PersistMigrate = async (state) => {
  if (!state) {
    return {
      _persist: { version: 0, rehydrated: true },
    };
  }

  const version = state._persist?.version || 0;
  if (version === 0) {
    // 处理旧版本状态
    const currentState = state as unknown as { auth?: StoredAuthState };
    return {
      ...state,
      auth: currentState.auth
        ? {
            token: currentState.auth.token,
            user: currentState.auth.user,
          }
        : null,
      _persist: {
        ...state._persist,
        version: 0,
        rehydrated: true,
      },
    };
  }
  return state;
};

// 状态合并函数
function createStateReconciler<T>(): StateReconciler<T> {
  return (inboundState, _originalState, reducedState) => ({
    ...reducedState,
    ...inboundState,
  });
}

// 创建基础配置
export function createPersistConfig<T extends object>(key: string): PersistConfig<T> {
  const debug = process.env.NODE_ENV !== 'production';

  return {
    key,
    storage,
    whitelist: ['auth'],
    transforms: [authTransform],
    version: 0,
    migrate,
    stateReconciler: createStateReconciler<T>(),
    debug,
  };
}

// 导出默认的 persistConfig
export const persistConfig = createPersistConfig<RootState>('root');
