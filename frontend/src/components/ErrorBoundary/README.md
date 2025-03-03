# 错误边界组件使用文档

## ErrorBoundary
用于捕获子组件树中的 JavaScript 错误，并显示备用 UI。

### 属性
- `fallback`: 错误发生时显示的备用 UI。

### 示例
```jsx
<ErrorBoundary fallback={<div>发生错误，请重试！</div>}>
  <ChildComponent />
</ErrorBoundary>
``` 