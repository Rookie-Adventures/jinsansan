# 工具模块 (Utils)

## 目录结构

```
utils/
├── http/           # HTTP 请求工具
├── storage/        # 存储工具
├── validation/     # 验证工具
├── format/         # 格式化工具
└── security/       # 安全工具
```

## 工具规范

### 命名规范
- 工具文件使用 camelCase 命名（如 `httpClient.ts`）
- 工具目录使用 kebab-case 命名（如 `http-client`）
- 测试文件使用 `.test.ts` 后缀

### 工具结构
```typescript
// 工具模板
export const util = {
  method: (param: T): R => {
    // 实现逻辑
    return result;
  }
};
```

## 工具分类

### 1. HTTP 工具 (http/)
- `client`: HTTP 客户端
- `interceptors`: 请求拦截器
- `error`: 错误处理
- `types`: 类型定义

### 2. 存储工具 (storage/)
- `localStorage`: 本地存储
- `sessionStorage`: 会话存储
- `cookie`: Cookie 管理
- `cache`: 缓存管理

### 3. 验证工具 (validation/)
- `rules`: 验证规则
- `schemas`: 验证模式
- `validators`: 验证器
- `messages`: 错误消息

### 4. 格式化工具 (format/)
- `date`: 日期格式化
- `number`: 数字格式化
- `currency`: 货币格式化
- `text`: 文本格式化

### 5. 安全工具 (security/)
- `encryption`: 加密工具
- `token`: Token 管理
- `xss`: XSS 防护
- `csrf`: CSRF 防护

## 使用示例

### HTTP 工具使用
```typescript
import { http } from '@/utils/http/client';

// GET 请求
const getData = async () => {
  try {
    const response = await http.get('/api/data');
    return response.data;
  } catch (error) {
    // 处理错误
  }
};
```

### 存储工具使用
```typescript
import { storage } from '@/utils/storage/localStorage';

// 存储数据
storage.set('key', value);

// 获取数据
const value = storage.get('key');
```

### 验证工具使用
```typescript
import { validate } from '@/utils/validation/rules';

// 验证数据
const isValid = validate({
  username: 'test',
  password: 'password'
}, rules);
```

## 最佳实践

1. **工具设计**
   - 保持工具的单一职责
   - 使用 TypeScript 类型定义
   - 提供必要的参数文档

2. **性能优化**
   - 合理使用缓存
   - 避免重复计算
   - 优化算法复杂度

3. **测试规范**
   - 编写单元测试
   - 测试边界情况
   - 测试错误处理

4. **错误处理**
   - 统一的错误处理机制
   - 友好的错误提示
   - 错误日志记录

## 注意事项

1. 工具开发时需要考虑：
   - 工具的可复用性
   - 工具的可测试性
   - 工具的可维护性
   - 工具的性能表现

2. 工具使用时的注意事项：
   - 正确处理异常
   - 遵循使用规范
   - 注意安全性

## 更新日志

### v1.0.0
- 初始化工具模块
- 实现基础工具
- 添加工具文档 