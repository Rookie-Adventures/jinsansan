# ESLint 配置

## 配置特性
- 新版 flat config 配置
- TypeScript 集成
- React 规则支持
- 导入排序规则

## 实际配置
```typescript
import { defineConfig, flatConfig } from 'eslint';

export default defineConfig([
  flatConfig({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'import'
    ],
    rules: {
      // 函数行数限制
      'max-lines-per-function': ['error', { 
        max: 60,
        skipBlankLines: true,
        skipComments: true 
      }],
      // 参数数量限制
      'max-params': ['error', 4],
      // 禁用 console
      'no-console': 'warn',
      // 未使用变量
      'no-unused-vars': 'error',
      // TypeScript 规则
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // 导入排序
      'import/order': ['warn', {
        'groups': [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always'
      }]
    },
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    settings: {
      react: {
        version: 'detect'
      }
    }
  })
]);
```

## 关键规则说明

### 代码质量规则
- `max-lines-per-function`: 限制函数最大行数为 60 行
- `max-params`: 限制函数参数最大数量为 4 个
- `no-console`: 警告使用 console
- `no-unused-vars`: 禁止未使用的变量

### TypeScript 规则
- `@typescript-eslint/no-explicit-any`: 禁止使用 any 类型
- `@typescript-eslint/explicit-function-return-type`: 关闭显式返回类型要求

### React 规则
- `react-hooks/rules-of-hooks`: 强制 Hooks 规则
- `react-hooks/exhaustive-deps`: 检查 useEffect 依赖

### 导入规则
- `import/order`: 强制导入排序和分组
  - 内置模块和外部模块优先
  - 内部模块其次
  - 相对导入最后
  - 分组之间保持空行

## 最佳实践
1. 遵循函数行数和参数限制
2. 避免使用 any 类型
3. 保持导入顺序整洁
4. 注意 React Hooks 的使用规范
5. 及时处理未使用的变量 