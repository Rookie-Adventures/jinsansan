# 状态管理

## 当前实现状态 (2024年1月)

### 已实现的技术栈 ✅
- Redux Toolkit 2.0.1
- Redux Persist 6.0.0
- Zustand 4.4.7 (备选状态管理)

### 已实现的状态结构 ✅

```typescript
// RootState 结构
interface RootState {
  app: AppState;
  auth: AuthState;
}

// App 状态
interface AppState {
  darkMode: boolean;
  loading: boolean;
  toast: {
    open: boolean;
    message: string;
    severity: AlertColor;
  };
}

// Auth 状态
interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

### 已实现功能 ✅

#### 1. Store 配置
```typescript
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
```

#### 2. 持久化配置
```typescript
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['app', 'auth'],
};
```

#### 3. 类型安全 Hooks
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 规划中的重要功能 📋

#### 1. 高级状态管理
- **状态规范化**
  - 实体关系管理
  - 数据扁平化
  - 引用关系处理

- **状态分片策略**
  - 动态状态注册
  - 状态代码分割
  - 按需加载状态

#### 2. 性能优化
- **选择器优化**
  - 记忆化选择器
  - 派生状态计算
  - 重渲染优化

- **中间件增强**
  - 异步操作队列
  - 批量更新处理
  - 状态变更追踪

#### 3. 缓存策略
- **多级缓存**
  - 内存缓存
  - 持久化缓存
  - 缓存失效策略

- **状态同步**
  - 离线状态管理
  - 状态冲突解决
  - 乐观更新

### 已实现的状态切片 ✅

#### 1. App Slice
```typescript
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

#### 2. Auth Slice
```typescript
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

### 使用示例

#### 1. 使用认证状态
```typescript
const LoginPage = () => {
  const { loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogin = async (data: LoginFormData) => {
    await dispatch(login(data));
  };
};
```

#### 2. 使用全局状态
```typescript
const Header = () => {
  const { darkMode } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  return (
    <IconButton onClick={() => dispatch(toggleDarkMode())}>
      {darkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};
```

#### 3. 使用全局提示
```typescript
const Component = () => {
  const dispatch = useAppDispatch();

  const handleSuccess = () => {
    dispatch(showToast({
      message: '操作成功',
      severity: 'success'
    }));
  };
};

### 新增功能 (2024年1月) ✅

#### 1. 中间件系统

```typescript
// 中间件配置
const customMiddleware = [
  errorMiddleware,
  ...(process.env.NODE_ENV !== 'production' ? [loggerMiddleware, performanceMiddleware] : []),
];

// Store 配置
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
```

##### 1.1 错误处理中间件
- 统一的错误处理机制
- 自动错误提示
- 错误日志记录

##### 1.2 日志中间件（开发环境）
- Action 分发日志
- 状态变更追踪
- 开发调试支持

##### 1.3 性能监控中间件（开发环境）
- Action 执行时间监控
- 性能瓶颈检测
- 超时警告（>16ms）

#### 2. 选择器系统

```typescript
// 基础选择器
export const selectAuth = (state: RootState) => state.auth;
export const selectApp = (state: RootState) => state.app;

// Memoized 选择器
export const selectUser = createSelector(
  selectAuth,
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  selectAuth,
  (auth) => !!auth.token
);

export const selectDarkMode = createSelector(
  selectApp,
  (app) => app.darkMode
);

// 复合选择器
export const selectUserPermissions = createSelector(
  selectUser,
  (user) => user?.permissions || []
);

export const selectIsAdmin = createSelector(
  selectUserPermissions,
  (permissions) => permissions.includes('admin')
);
```

#### 3. 使用示例

```typescript
// 在组件中使用选择器
const MyComponent = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const darkMode = useAppSelector(selectDarkMode);
  const isAdmin = useAppSelector(selectIsAdmin);
  const dispatch = useAppDispatch();

  // 使用选择器和dispatch
  return (
    <div>
      {isAuthenticated && <AdminPanel />}
      <ThemeToggle darkMode={darkMode} />
    </div>
  );
};
```

### 性能优化 ✅

#### 1. 选择器优化
- 使用 createSelector 实现记忆化
- 避免不必要的重新计算
- 优化派生状态计算

#### 2. 中间件性能
- 开发环境性能监控
- 条件性中间件加载
- Action 执行时间追踪

#### 3. 状态更新优化
- 批量更新处理
- 选择性状态持久化
- 状态分片管理 