# 后端全局基础设施实现步骤

## 第一阶段：基础配置和环境搭建 ✅

### 1. 项目初始化 ✅
- [x] 创建后端项目目录
- [x] 初始化 package.json
- [x] 安装基础依赖 (express, typescript, etc.)

### 2. 配置管理 (config/) ✅
- [x] app.config.ts: 应用配置
  - [x] 端口配置 (3001)
  - [x] 环境变量配置
  - [x] CORS 配置
- [x] db.config.ts: 数据库配置
  - [x] MongoDB 连接配置
  - [x] Redis 配置（开发环境已禁用）
- [x] swagger.config.ts: API文档配置

### 3. 环境配置 ✅
- [x] .env 文件配置
- [x] Docker 配置
  - [x] MongoDB 容器配置
  - [-] Redis 容器配置（暂不需要）

## 第二阶段：核心功能实现 ✅

### 4. 类型定义 (types/) ✅
- [x] 创建 types 目录
- [x] 定义 API 响应类型
```typescript
interface ApiResponse<T> {
  code: ErrorCode;
  message: string;
  data: T;
  timestamp: number;
}
```
- [x] 定义错误码枚举
```typescript
enum ErrorCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}
```
- [x] 定义通用接口和 DTOs
  - [x] 分页请求接口 (PaginationQuery)
  - [x] 分页响应接口 (PaginatedResponse)

### 5. 工具类 (utils/) ✅
- [x] 创建 utils 目录
- [x] 实现响应封装工具 (response.util.ts)
```typescript
class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T>;
  static error(code: ErrorCode, message: string): ApiResponse<null>;
}
```
- [x] 实现错误处理工具 (error.util.ts)
- [x] 实现加密工具 (encryption.util.ts)

### 6. 中间件 (middleware/) ✅
- [x] 创建 middleware 目录
- [x] 实现认证中间件 (auth.middleware.ts)
- [x] 实现权限控制中间件 (role.middleware.ts)
- [x] 实现错误处理中间件 (error.middleware.ts)
- [x] 实现日志中间件 (logger.middleware.ts)

## 第三阶段：安全和数据库 ✅

### 7. 安全基础设施 ✅
- [x] 实现 JWT 认证机制
- [x] 实现角色权限控制
- [x] 实现数据加密 (encryption.util.ts)
- [x] 配置安全中间件 (helmet)

### 8. 数据库基础设施 ✅
- [x] 实现 MongoDB 连接和配置
- [x] 实现 Redis 缓存配置（已配置，开发环境禁用）
- [x] 定义基础数据库模型
- [x] 实现数据访问层基础结构

## 第四阶段：测试和文档 🚧

### 9. 测试基础设施 ✅
- [x] 配置 Vitest 测试框架
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types/'
      ]
    }
  }
});
```
- [x] 创建测试工具和辅助函数
- [x] 配置测试环境
- [x] 配置测试数据库
- [x] 实现基础单元测试
  - [x] 工具类测试
  - [x] 中间件测试
  - [x] 服务层测试

### 10. API 文档基础设施 ✅
- [x] 配置 Swagger/OpenAPI
- [x] 实现 API 文档生成器
- [x] 定义 API 响应格式规范
- [x] 实现错误码定义

## 第五阶段：监控和部署 🚧

### 11. 日志和监控基础设施 (进行中)
- [ ] 配置日志系统
- [ ] 实现性能监控
- [ ] 实现错误追踪
- [ ] 实现审计日志

### 12. CI/CD 基础设施 (未开始)
- [ ] 配置自动化测试
- [ ] 实现代码质量检查
- [ ] 创建部署脚本
- [ ] 配置不同环境

## 注意事项
1. ✅ 每个阶段完成后进行测试
2. ✅ 确保代码符合 TypeScript 规范
3. ✅ 保持与前端的类型定义同步
4. ✅ 遵循 RESTful API 设计规范
5. ✅ 注意代码复用和模块化

## 开发规范
1. ✅ 使用 TypeScript 强类型
2. ✅ 遵循 ESLint 规则
3. ✅ 编写完整的单元测试
4. ✅ 保持代码简洁清晰
5. ✅ 添加必要的注释和文档

## 目录结构
```
backend/
├── src/
│   ├── config/               # 配置文件
│   │   ├── app.config.ts     # 应用配置
│   │   ├── db.config.ts      # 数据库配置
│   │   └── swagger.config.ts # API文档配置
│   ├── controllers/          # 控制器
│   │   └── base.controller.ts # 基础控制器
│   ├── services/            # 服务层
│   │   └── order.service.ts  # 订单服务示例
│   ├── models/              # 数据模型
│   │   └── order.model.ts    # 订单模型示例
│   ├── middleware/          # 中间件
│   │   ├── auth.middleware.ts    # 认证中间件
│   │   ├── role.middleware.ts    # 权限中间件
│   │   ├── error.middleware.ts   # 错误处理
│   │   └── logger.middleware.ts  # 日志中间件
│   ├── utils/               # 工具函数
│   │   ├── response.util.ts     # 响应工具
│   │   ├── error.util.ts        # 错误工具
│   │   └── encryption.util.ts   # 加密工具
│   ├── types/               # 类型定义
│   │   ├── api.response.types.ts # API响应类型
│   │   └── error.codes.ts        # 错误码
│   └── app.ts               # 应用入口
├── test/                    # 测试文件
│   └── setup.ts            # 测试配置
├── docs/                    # 文档
└── scripts/                 # 脚本
```