# 上下文模块 (Contexts)

## 目录结构

```
contexts/
├── ErrorContext.tsx    # 错误处理上下文
└── __tests__/         # 测试文件
```

## 上下文规范

### 命名规范
- 上下文文件使用 PascalCase 命名（如 `ErrorContext.tsx`）
- 上下文目录使用 kebab-case 命名（如 `error-context`）
- 测试文件使用 `.test.tsx` 后缀

### 上下文结构
```typescript
// 上下文模板
import { createContext, useContext, ReactNode } from 'react';

interface ContextType {
  value: any;
  setValue: (value: any) => void;
}

const Context = createContext<ContextType | undefined>(undefined);

export const Provider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<any>(null);

  return (
    <Context.Provider value={{ value, setValue }}>
      {children}
    </Context.Provider>
  );
};

export const useContext = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useContext must be used within a Provider');
  }
  return context;
};
```

## 上下文分类

### 1. 错误处理上下文 (ErrorContext.tsx)
- 错误状态管理
- 错误处理函数
- 错误展示组件

## 使用示例

### 上下文配置
```typescript
import { ErrorProvider } from '@/contexts/ErrorContext';

export const App = () => {
  return (
    <ErrorProvider>
      <AppContent />
    </ErrorProvider>
  );
};
```

### 上下文使用
```typescript
import { useError } from '@/contexts/ErrorContext';

export const ErrorComponent = () => {
  const { error, setError } = useError();
  
  return (
    <div>
      {error && <ErrorMessage message={error.message} />}
    </div>
  );
};
```

## 最佳实践

1. **上下文设计**
   - 保持上下文简单
   - 避免过度使用
   - 合理划分范围

2. **性能优化**
   - 使用 useMemo
   - 使用 useCallback
   - 避免不必要的重渲染

3. **测试规范**
   - 编写单元测试
   - 测试上下文值
   - 测试上下文更新

4. **开发规范**
   - 使用 TypeScript
   - 遵循 React 最佳实践
   - 保持代码简洁

## 注意事项

1. 上下文开发时需要考虑：
   - 上下文的可维护性
   - 上下文的性能表现
   - 上下文的类型安全
   - 上下文的测试覆盖

2. 上下文使用时的注意事项：
   - 正确处理上下文值
   - 处理上下文更新
   - 遵循上下文规范

## 更新日志

### v1.0.0
- 初始化上下文模块
- 实现错误处理上下文
- 添加上下文文档 