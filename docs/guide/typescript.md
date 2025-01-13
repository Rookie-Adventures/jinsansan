# TypeScript 配置

## 实际配置

### 前端配置 (frontend/tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Node 配置 (frontend/tsconfig.node.json)
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

## TypeScript 5.3.3 新特性

### 模板字面量类型
```typescript
// 按钮大小类型
type ButtonSize = `button-${
  | 'small'
  | 'medium'
  | 'large'}`;

// 颜色变体类型
type ColorVariant = `${
  | 'primary'
  | 'secondary'
  | 'error'}-${
  | 'light'
  | 'main'
  | 'dark'}`;
```

### 泛型组件模式
```typescript
interface DataProps<T> {
  data: T;
  onUpdate: (newData: T) => void;
  render: (item: T) => React.ReactNode;
}

function DataComponent<T>({ data, onUpdate, render }: DataProps<T>) {
  return (
    <div>
      {render(data)}
      <button onClick={() => onUpdate(data)}>Update</button>
    </div>
  );
}
```

### 类型系统增强
- 改进的类型推断
- 增强的泛型处理
- 更好的第三方库类型集成

## React & TypeScript 集成

### 版本兼容性
- React: 18.2.0
- TypeScript: 5.3.3
- @types/react: 18.2.7
- @types/react-dom: 18.2.7

### Hooks 类型定义
```typescript
// 状态 Hook
const [state, setState] = useState<string>('');

// 引用 Hook
const inputRef = useRef<HTMLInputElement>(null);

// 自定义 Hook
function useData<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  return { data, setData };
}
```

### 事件处理
```typescript
// 表单事件
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// 输入事件
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

## 性能优化

### 异步操作
```typescript
// 异步本地存储
const asyncLocalStorage = new AsyncLocalStorage();

// 异步迭代器
async function* dataGenerator() {
  for await (const item of items) {
    yield item;
  }
}
```

### 编译优化
- 增量编译支持
- 项目引用优化
- 更快的类型检查

## 最佳实践

### 类型安全
1. 启用严格模式 (`strict: true`)
2. 避免使用 `any`
3. 使用类型断言而不是类型转换
4. 优先使用接口定义对象类型

### 代码组织
1. 使用路径别名简化导入
2. 分离类型定义到 `.d.ts` 文件
3. 使用项目引用管理大型项目
4. 保持类型声明文件的整洁

### 性能考虑
1. 使用项目引用提升编译速度
2. 合理使用类型推断
3. 避免过度使用泛型
4. 优化类型导入 