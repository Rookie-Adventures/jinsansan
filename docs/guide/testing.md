# 测试规范文档

> 状态：📝 待实施
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] 测试框架选型 (100%)
> - [x] 单元测试规范 (100%)
> - [ ] 集成测试实施 (40%)
> - [ ] E2E测试实施 (20%)
> - [ ] CI/CD集成 (10%)

## 1. 测试框架

### 1.1 技术栈
- Jest 29.7.0 (单元测试)
- React Testing Library 14.1.2 (组件测试)
- Cypress 13.6.1 (E2E测试)
- Supertest 6.3.3 (API测试)

### 1.2 配置示例
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

## 2. 单元测试规范

### 2.1 命名规范
```typescript
// 文件命名: [name].test.ts
// 测试套件命名: describe('UnitName', () => {})
// 测试用例命名: test('should do something when condition', () => {})
```

### 2.2 测试示例

#### 工具函数测试
```typescript
// utils/string.test.ts
import { capitalize } from './string';

describe('String Utils', () => {
  test('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });
});
```

#### 组件测试
```typescript
// components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('should call onClick when clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Button onClick={onClick}>Click Me</Button>
    );
    
    fireEvent.click(getByText('Click Me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## 3. 集成测试规范

### 3.1 API测试
```typescript
// api/auth.test.ts
import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### 3.2 数据库测试
```typescript
// database/user.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from '../models';

describe('User Model', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  test('should create & save user successfully', async () => {
    const user = new UserModel({
      username: 'test',
      email: 'test@test.com'
    });
    const savedUser = await user.save();
    expect(savedUser.username).toBe('test');
  });
});
```

## 4. E2E测试规范

### 4.1 Cypress配置
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true
  }
});
```

### 4.2 测试示例
```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## 5. 测试覆盖率要求

### 5.1 覆盖率目标
- 单元测试: ≥ 80%
- 集成测试: ≥ 60%
- E2E测试: 关键流程100%

### 5.2 覆盖率检查
```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 检查特定文件的覆盖率
npm run test:coverage -- --collectCoverageFrom="src/components/**/*.{ts,tsx}"
```

## 6. 测试最佳实践

### 6.1 通用原则
- 测试应该是独立的
- 避免测试实现细节
- 使用有意义的测试数据
- 保持测试简单明了
- 遵循 AAA (Arrange-Act-Assert) 模式

### 6.2 Mock 使用规范
```typescript
// 服务 mock 示例
jest.mock('../services/auth', () => ({
  login: jest.fn().mockResolvedValue({ token: 'fake-token' })
}));

// API 请求 mock 示例
jest.spyOn(global, 'fetch').mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked data' })
  })
);
```

### 6.3 测试数据管理
```typescript
// fixtures/users.ts
export const testUsers = {
  valid: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  },
  invalid: {
    username: 'test',
    email: 'invalid-email',
    password: '123'
  }
};
```

## 7. CI/CD 集成

### 7.1 GitHub Actions配置
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### 7.2 预提交钩子
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:staged",
      "pre-push": "npm run test"
    }
  }
} 