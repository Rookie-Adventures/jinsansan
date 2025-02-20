import { createTransform, type PersistConfig, type StateReconciler, type PersistMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { RootState } from './types';

// 定义状态类型
interface AuthState {
  token?: string;
  user?: {
    id: string;
    username: string;
  } | null;
}

interface ThemeState {
  mode?: string;
  customizations?: Record<string, unknown>;
}

// 转换函数
const authTransform = createTransform(
  // 保存时转换
  (inboundState: Partial<AuthState> | undefined) => {
    if (!inboundState) return {};
    const { token, user } = inboundState;
    return {
      token,
      user: user ? { id: user.id, username: user.username } : null,
    };
  },
  // 加载时转换
  (outboundState: Partial<AuthState> | undefined) => outboundState || {},
  { whitelist: ['auth'] }
);

const themeTransform = createTransform(
  // 保存时转换
  (inboundState: Partial<ThemeState> | undefined) => {
    if (!inboundState) return {};
    const { mode, customizations } = inboundState;
    return { mode, customizations };
  },
  // 加载时转换
  (outboundState: Partial<ThemeState> | undefined) => outboundState || {},
  { whitelist: ['theme'] }
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
    const currentState = state as unknown as { auth?: AuthState };
    return {
      ...state,
      auth: currentState.auth
        ? {
            token: currentState.auth.token,
            user: currentState.auth.user
              ? {
                  id: currentState.auth.user.id,
                  username: currentState.auth.user.username,
                }
              : null,
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
    whitelist: ['auth', 'theme'],
    transforms: [authTransform, themeTransform],
    version: 0,
    migrate,
    stateReconciler: createStateReconciler<T>(),
    debug,
  };
}

// 导出默认的 persistConfig
export const persistConfig = createPersistConfig<RootState>('root');
