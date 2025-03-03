# 状态管理使用文档

## Store
状态管理相关的模块。

### 示例
```typescript
import { createStore } from 'redux';

const store = createStore(rootReducer);
```

## Slices
状态切片相关的模块。

### 示例
```typescript
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'example',
  initialState: {},
  reducers: {},
});
```

## Middleware
中间件相关的模块。

### 示例
```typescript
import { applyMiddleware } from 'redux';

const store = createStore(rootReducer, applyMiddleware(thunk));
```

## Selectors
选择器相关的模块。

### 示例
```typescript
const selectExample = (state) => state.example;
``` 