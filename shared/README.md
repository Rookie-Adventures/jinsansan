# @jinshanshan/shared

## 简介
这是一个用于前后端共享代码的 TypeScript 包，包含类型定义、工具函数和常量。

## 安装
```bash
npm install @jinshanshan/shared
```

## 目录结构
```
shared/
├── src/
│   ├── types/           # 共享类型定义
│   ├── utils/           # 共享工具函数
│   ├── constants/       # 共享常量
│   └── index.ts         # 入口文件
├── dist/                # 编译后的文件
├── package.json         # 包配置
└── tsconfig.json        # TypeScript 配置
```

## 开发指南

### 构建
```bash
npm run build
```

### 类型检查
```bash
npm run type-check
```

### 代码格式化
```bash
npm run format
```

### 代码检查
```bash
npm run lint
```

## 使用示例

### 类型使用
```typescript
import { ApiResponse, User } from '@jinshanshan/shared/types';

export const fetchUser = async (): Promise<ApiResponse<User>> => {
  const response = await fetch('/api/user');
  return response.json();
};
```

### 工具使用
```typescript
import { formatError } from '@jinshanshan/shared/utils';

try {
  // 业务逻辑
} catch (error) {
  const formattedError = formatError(error as Error);
  // 错误处理
}
```

### 常量使用
```typescript
import { API_ENDPOINTS } from '@jinshanshan/shared/constants';

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.json();
};
```

## 开发规范

### 命名规范
- 类型文件使用 PascalCase 命名（如 `UserTypes.ts`）
- 工具文件使用 camelCase 命名（如 `authUtils.ts`）
- 常量文件使用 SCREAMING_SNAKE_CASE 命名（如 `API_CONSTANTS.ts`）
- 测试文件使用 `.test.ts` 后缀

### 类型定义
- 使用 TypeScript 接口和类型
- 保持类型简单和可复用
- 避免类型重复
- 使用泛型增加灵活性

### 工具函数
- 保持函数纯函数
- 添加完整的类型注解
- 添加 JSDoc 文档注释
- 编写单元测试

### 常量管理
- 使用 const 断言
- 避免魔法字符串
- 集中管理常量
- 使用枚举或联合类型

## 注意事项

1. 开发注意事项：
   - 确保代码类型安全
   - 保持向后兼容性
   - 遵循代码规范
   - 编写完整的文档

2. 使用注意事项：
   - 正确处理类型
   - 处理错误情况
   - 遵循代码规范
   - 注意版本兼容性

## 更新日志

### v1.0.0
- 初始化共享模块
- 实现基础共享代码
- 添加共享代码文档 