# 自定义 Hook 使用文档

## useAppSelector
用于从 Redux store 中选择状态的 Hook。

### 示例
```javascript
const value = useAppSelector(state => state.someValue);
``` 