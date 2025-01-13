# 开发规范

## ESLint 规则配置

### 新版 Flat Config

```javascript
// eslint.config.js
import { defineConfig, flatConfig } from 'eslint';

export default defineConfig([
  flatConfig({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        myGlobal: 'readonly',
      },
    },
    plugins: ['react', 'jsx-a11y', 'import'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'import/order': ['warn', {
        groups: [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always'
      }]
    },
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/node_modules/**', '**/dist/**'],
  }),
]);
```

### TypeScript 规则集

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "error"
  }
}
```

### 导入排序规则

```json
{
  "import/order": [
    "error",
    {
      "groups": [
        ["builtin", "external"],
        ["internal"],
        ["parent", "sibling", "index"]
      ],
      "pathGroups": [
        {
          "pattern": "@/**",
          "group": "internal"
        }
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc"
      }
    }
  ]
}
```

## TypeScript 严格模式

### 配置示例

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true
  }
}
```

## 代码格式化规则

### Prettier 配置

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

## 文件命名规范

### 目录结构

```plaintext
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── features/       # 功能组件
├── hooks/              # 自定义 Hooks
├── pages/              # 页面组件
├── services/           # API 服务
├── store/              # 状态管理
├── types/              # 类型定义
└── utils/              # 工具函数
```

### 命名规则

1. **组件文件**
   - 使用 PascalCase
   - 例如：`UserProfile.tsx`, `LoginForm.tsx`

2. **Hook 文件**
   - 使用 camelCase
   - 以 `use` 开头
   - 例如：`useAuth.ts`, `useForm.ts`

3. **工具函数文件**
   - 使用 camelCase
   - 例如：`formatDate.ts`, `validation.ts`

4. **类型定义文件**
   - 使用 camelCase
   - 以 `.d.ts` 或 `.types.ts` 结尾
   - 例如：`api.types.ts`, `global.d.ts`

## 最佳实践

1. **代码组织**
   - 按功能模块组织代码
   - 保持目录结构清晰
   - 遵循单一职责原则

2. **代码质量**
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 保持代码格式统一
   - 编写单元测试

3. **类型安全**
   - 启用 TypeScript 严格模式
   - 避免使用 any 类型
   - 定义完整的类型声明

4. **性能优化**
   - 实现代码分割
   - 优化构建配置
   - 监控性能指标

5. **版本控制**
   - 遵循语义化版本
   - 使用规范的提交信息
   - 保持分支策略清晰 