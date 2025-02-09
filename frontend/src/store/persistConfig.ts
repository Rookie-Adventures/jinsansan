import type { Transform, PersistConfig, PersistedState } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createTransform } from 'redux-persist';
import { RootState } from './types';

// 定义可序列化的状态类型
type SerializableValue = string | number | boolean | null | undefined | SerializableObject | Date;
interface SerializableObject {
  [key: string]: SerializableValue;
}

// 定义转换器配置类型
interface TransformConfig {
  debug?: boolean;
  whitelist?: string[];
}

// 转换单个值
function transformSingleValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

// 转换对象值
function transformObjectValue(
  value: Record<string, unknown>
): Record<string, unknown> {
  return Object.entries(value).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: v && typeof v === 'object' && !(v instanceof Date)
        ? transformObjectValue(v as Record<string, unknown>)
        : transformSingleValue(v)
    }),
    {}
  );
}

// 转换状态
function transformState<T extends Record<string, unknown>>(
  state: T
): T {
  if (!state) return state;
  return transformObjectValue(state) as T;
}

// 创建日期转换器
function createDateTransform<T extends Record<string, unknown>>(): Transform<T, T, T, T> {
  return {
    in: (state: T, _key: keyof T, _config: TransformConfig): T => {
      return transformState(state);
    },
    out: (state: T, _key: keyof T, _config: TransformConfig): T => {
      return transformState(state);
    }
  };
}

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
const stateReconciler = (inboundState: any, originalState: any, reducedState: any, config: any) => {
  return {
    ...reducedState,
    ...inboundState
  };
};

// 创建基础配置
export function createPersistConfig<T>(key: string): PersistConfig<T> {
  const debug = process.env.NODE_ENV !== 'production';
  const defaultPersistState = {
    _persist: { version: 1, rehydrated: true }
  } as T & PersistedState;
  
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