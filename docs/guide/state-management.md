# 状态管理

## Redux Toolkit 集成

### 基础配置
项目使用 Redux Toolkit 进行状态管理，配置文件位于 `frontend/src/store/index.ts`：

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['app', 'auth'], // 只持久化这些 reducer
};

export const store = configureStore({
  reducer: {
    app: persistedReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
```

### 类型安全
使用 TypeScript 定义状态类型和 action 类型：

```typescript
// store/types.ts
export interface RootState {
  app: AppState;
  auth: AuthState;
}

export type AppDispatch = typeof store.dispatch;

// 类型安全的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## 状态切片

### App 状态切片
管理应用全局状态，如主题模式、加载状态、提示信息等：

```typescript
// store/slices/appSlice.ts
interface AppState {
  darkMode: boolean;
  loading: boolean;
  toast: {
    open: boolean;
    message: string;
    severity: AlertColor;
  };
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showToast: (state, action: PayloadAction<Omit<ToastState, 'open'>>) => {
      state.toast = {
        ...action.payload,
        open: true,
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    },
  },
});
```

### Auth 状态切片
管理认证相关状态，包括用户信息、token 等：

```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});
```

## 持久化配置

### Redux Persist
使用 `redux-persist` 实现状态持久化：

```typescript
// store/persistConfig.ts
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['app', 'auth'], // 只持久化指定的 reducer
};

// 序列化处理
const transformState = <T extends Record<string, unknown>>(state: T): T => {
  if (!state) return state;
  return transformObjectValue(state) as T;
};

// 创建日期转换器
const createDateTransform = <T extends Record<string, unknown>>(): Transform<T, T, T, T> => ({
  in: (state: T) => transformState(state),
  out: (state: T) => transformState(state),
});
```

## 自定义 Hooks

### useAuth Hook
封装认证相关的状态操作：

```typescript
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate('/');
    } catch (err) {
      if (isAuthError(err)) {
        navigate('/login');
      }
      throw err;
    }
  }, [dispatch, navigate]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
    getCurrentUser: fetchCurrentUser,
  };
};
```

## 最佳实践

### 状态组织
1. 按功能模块拆分状态切片
2. 使用 TypeScript 确保类型安全
3. 合理使用持久化机制
4. 实现必要的状态转换器

### 性能优化
1. 合理使用选择器缓存
2. 避免不必要的状态更新
3. 优化持久化配置
4. 控制序列化数据大小

### 异步操作
1. 使用 createAsyncThunk 处理异步操作
2. 实现统一的错误处理
3. 管理加载状态
4. 处理并发请求

### 状态访问
1. 使用类型安全的 hooks
2. 实现必要的状态选择器
3. 避免重复的状态订阅
4. 优化组件重渲染

## 注意事项

1. 避免存储敏感信息
2. 控制持久化数据大小
3. 处理序列化异常
4. 及时清理过期状态
5. 注意状态依赖关系 