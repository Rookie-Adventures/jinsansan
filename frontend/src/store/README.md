# 状态管理模块 (Store)

## 目录结构

```
store/
├── middleware/     # Redux 中间件
├── selectors/      # 状态选择器
├── slices/         # Redux 切片
├── types/          # 类型定义
├── index.ts        # 状态管理入口
├── persistConfig.ts # 持久化配置
├── types.ts        # 基础类型定义
└── __tests__/      # 测试文件
```

## 状态管理规范

### 命名规范
- 切片文件使用 camelCase 命名（如 `authSlice.ts`）
- 选择器文件使用 camelCase 命名（如 `authSelectors.ts`）
- 中间件文件使用 camelCase 命名（如 `loggerMiddleware.ts`）
- 测试文件使用 `.test.ts` 后缀

### 状态结构
```typescript
// 切片模板
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  data: any;
  loading: boolean;
  error: Error | null;
}

const initialState: State = {
  data: null,
  loading: false,
  error: null,
};

export const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
  },
});
```

## 状态分类

### 1. 中间件 (middleware/)
- `loggerMiddleware`: 日志中间件
- `errorMiddleware`: 错误处理中间件
- `persistMiddleware`: 持久化中间件
- `thunkMiddleware`: 异步操作中间件
- `sagaMiddleware`: 副作用处理中间件

### 2. 选择器 (selectors/)
- `authSelectors`: 认证状态选择器
- `userSelectors`: 用户状态选择器
- `uiSelectors`: UI 状态选择器
- `errorSelectors`: 错误状态选择器
- `loadingSelectors`: 加载状态选择器

### 3. 切片 (slices/)
- `authSlice`: 认证状态切片
- `userSlice`: 用户状态切片
- `uiSlice`: UI 状态切片
- `errorSlice`: 错误状态切片
- `loadingSlice`: 加载状态切片

### 4. 类型定义 (types/)
- `store.types.ts`: 状态管理基础类型
- `slice.types.ts`: 切片相关类型
- `action.types.ts`: 动作相关类型
- `selector.types.ts`: 选择器相关类型

## 使用示例

### 状态配置
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './slices';
import { persistConfig } from './persistConfig';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
  ...persistConfig,
});
```

### 切片使用
```typescript
import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});
```

### 选择器使用
```typescript
import { useSelector } from 'react-redux';
import { selectUser } from './selectors/userSelectors';

export const UserProfile = () => {
  const user = useSelector(selectUser);
  
  return (
    <div>
      {user.name}
    </div>
  );
};
```

### 异步操作
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await api.getUser(userId);
    return response.data;
  }
);

// 在组件中使用
const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchUser('123'));
  }, [dispatch]);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <div>{user.name}</div>;
};
```

### 状态持久化
```typescript
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'], // 只持久化这些状态
  blacklist: ['error', 'loading'], // 不持久化这些状态
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

### 状态订阅
```typescript
import { store } from './store';

// 订阅状态变化
const unsubscribe = store.subscribe(() => {
  const state = store.getState();
  console.log('State updated:', state);
});

// 取消订阅
unsubscribe();
```

## 最佳实践

1. **状态设计**
   - 使用不可变更新
   - 实现状态持久化
   - 优化状态结构

2. **性能优化**
   - 使用选择器缓存
   - 避免不必要的重渲染
   - 优化状态更新

3. **测试规范**
   - 编写单元测试
   - 测试状态更新
   - 测试选择器

4. **开发规范**
   - 使用 TypeScript
   - 遵循 Redux 最佳实践
   - 保持代码简洁

5. **状态组织**
   - 按功能模块划分
   - 避免状态重复
   - 保持状态扁平
   - 使用命名空间

6. **状态更新**
   - 使用不可变更新
   - 批量更新状态
   - 避免深层更新
   - 使用选择器优化

7. **错误处理**
   - 统一错误处理
   - 错误状态管理
   - 错误恢复机制
   - 用户反馈

8. **性能优化**
   - 使用 reselect
   - 避免不必要的更新
   - 优化重渲染
   - 使用 memo

## 注意事项

1. 状态开发时需要考虑：
   - 状态的可维护性
   - 状态的性能表现
   - 状态的类型安全
   - 状态的测试覆盖

2. 状态使用时的注意事项：
   - 正确处理异步操作
   - 处理状态持久化
   - 遵循状态规范

3. 状态测试注意事项：
   - 测试初始状态
   - 测试状态更新
   - 测试异步操作
   - 测试错误处理
   - 测试选择器性能

4. 状态调试注意事项：
   - 使用 Redux DevTools
   - 记录状态变化
   - 分析性能问题
   - 检查内存泄漏

## 更新日志

### v1.0.0
- 初始化状态管理模块
- 实现基础状态管理
- 添加状态管理文档

### v1.1.0
- 添加异步操作支持
- 优化状态持久化
- 增强错误处理
- 改进性能优化

### v1.2.0
- 添加状态订阅机制
- 优化状态组织
- 增强测试覆盖
- 改进调试工具 