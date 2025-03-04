# 服务模块 (Services)

## 目录结构

```
services/
├── README.md
├── api/            # API 服务
│   ├── auth.ts     # 认证服务
│   ├── user.ts     # 用户服务
│   └── index.ts    # API 服务导出
├── http/           # HTTP 服务
│   ├── client.ts   # HTTP 客户端
│   ├── config.ts   # HTTP 配置
│   └── index.ts    # HTTP 服务导出
└── index.ts        # 服务导出入口
```

## 服务规范

### 命名规则
- 服务文件使用 camelCase 命名（如 `authService.ts`）
- 服务目录使用 kebab-case 命名（如 `api-service`）
- 测试文件使用 `.test.ts` 后缀

### 服务结构
```typescript
// 服务模板
import { ApiResponse, ApiError } from '@shared/types';
import { httpClient } from './http';

export class ServiceName {
  async methodName(): Promise<ApiResponse<DataType>> {
    try {
      const response = await httpClient.request({
        method: 'GET',
        url: '/api/endpoint'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    // 错误处理逻辑
  }
}
```

## 服务分类

### 1. API 服务 (api/)
- `AuthService`: 认证相关 API
- `UserService`: 用户相关 API
- `ProductService`: 产品相关 API
- `OrderService`: 订单相关 API

### 2. HTTP 服务 (http/)
- `HttpClient`: HTTP 请求客户端
- `HttpConfig`: HTTP 配置管理
- `HttpInterceptor`: HTTP 请求拦截器
- `HttpErrorHandler`: HTTP 错误处理

## 使用示例

### API 服务使用
```typescript
import { authService } from '@/services/api';

// 登录
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await authService.login(credentials);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await userService.getProfile();
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
```

### HTTP 服务使用
```typescript
import { httpClient } from '@/services/http';

// 发送请求
const response = await httpClient.request({
  method: 'POST',
  url: '/api/endpoint',
  data: requestData
});

// 处理响应
if (response.code === 200) {
  return response.data;
} else {
  throw new Error(response.message);
}
```

## 最佳实践

### 1. 错误处理
- 使用统一的错误处理机制
- 处理网络错误和业务错误
- 提供友好的错误信息

### 2. 请求配置
- 使用统一的请求配置
- 支持请求拦截和响应拦截
- 处理请求超时和重试

### 3. 数据转换
- 在服务层处理数据转换
- 确保数据类型安全
- 处理空值和默认值

### 4. 缓存策略
- 实现请求缓存
- 处理缓存失效
- 支持强制刷新

## 注意事项

### 1. 服务开发时需要考虑：
- 接口的稳定性
- 错误处理机制
- 性能优化
- 安全性

### 2. 服务使用时的注意事项：
- 正确处理异步操作
- 处理请求取消
- 避免重复请求
- 处理并发请求

## 更新日志

### 2024-03-04
- 初始化服务模块
- 添加文档
- 集成共享类型
- 更新服务规范 