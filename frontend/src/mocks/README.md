# 模拟数据模块 (Mocks)

## 目录结构

```
mocks/
├── handlers/       # 请求处理器
├── browser.ts      # 浏览器配置
└── handlers.ts     # 处理器配置
```

## 模拟数据规范

### 命名规范
- 处理器文件使用 camelCase 命名（如 `authHandlers.ts`）
- 处理器目录使用 kebab-case 命名（如 `api-handlers`）
- 测试文件使用 `.test.ts` 后缀

### 模拟数据结构
```typescript
// 处理器模板
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
      })
    );
  }),
];
```

## 模拟数据分类

### 1. 请求处理器 (handlers/)
- 认证处理器
- 用户处理器
- 数据处理器

### 2. 浏览器配置 (browser.ts)
- MSW 配置
- 浏览器设置
- 开发环境配置

### 3. 处理器配置 (handlers.ts)
- 全局处理器
- 错误处理器
- 延迟配置

## 使用示例

### 处理器配置
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 处理器使用
```typescript
import { rest } from 'msw';

export const authHandlers = [
  rest.post('/api/login', (req, res, ctx) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'fake-token',
          user: {
            id: 1,
            name: 'Admin',
            role: 'admin',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        message: 'Invalid credentials',
      })
    );
  }),
];
```

### 测试使用
```typescript
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should handle login', async () => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'password',
    }),
  });
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.token).toBe('fake-token');
});
```

## 最佳实践

1. **模拟数据设计**
   - 保持数据真实
   - 模拟错误情况
   - 支持动态数据

2. **性能优化**
   - 减少延迟
   - 优化响应
   - 缓存数据

3. **测试规范**
   - 编写单元测试
   - 测试错误处理
   - 测试边界情况

4. **开发规范**
   - 使用 TypeScript
   - 遵循 MSW 最佳实践
   - 保持代码简洁

## 注意事项

1. 模拟数据开发时需要考虑：
   - 数据的真实性
   - 数据的完整性
   - 数据的可维护性
   - 数据的测试覆盖

2. 模拟数据使用时的注意事项：
   - 正确处理请求
   - 处理错误情况
   - 遵循模拟数据规范

## 更新日志

### v1.0.0
- 初始化模拟数据模块
- 实现基础模拟数据
- 添加模拟数据文档 