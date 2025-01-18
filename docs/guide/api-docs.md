# API 文档规范

> 状态：🚧 开发中
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] 接口规范定义 (100%)
> - [x] 基础示例代码 (100%)
> - [x] 具体业务接口文档 (100%)
> - [x] 错误处理文档 (100%)
> - [x] 安全规范 (100%)

## 1. 接口规范

### 1.1 请求格式
```typescript
interface ApiRequest<T> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: T;
  headers?: Record<string, string>;
  cache?: {
    enable: boolean;
    ttl: number;
    key?: string;
  };
  retry?: {
    times: number;
    delay: number;
  };
}
```

### 1.2 响应格式
```typescript
interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 提示信息
  data: T;            // 响应数据
  timestamp: number;   // 时间戳
}
```

### 1.3 分页格式
```typescript
interface PaginationParams {
  page: number;      // 当前页码
  pageSize: number;  // 每页条数
}

interface PaginatedResponse<T> {
  items: T[];          // 数据列表
  total: number;       // 总条数
  page: number;        // 当前页码
  pageSize: number;    // 每页条数
  totalPages: number;  // 总页数
}
```

### 1.4 状态码定义
```typescript
enum ApiCode {
  SUCCESS = 200,           // 成功
  PARAM_ERROR = 400,       // 参数错误
  UNAUTHORIZED = 401,      // 未授权
  FORBIDDEN = 403,         // 禁止访问
  NOT_FOUND = 404,        // 资源不存在
  VALIDATION_ERROR = 422,  // 数据验证错误
  SERVER_ERROR = 500,      // 服务器错误
  SERVICE_BUSY = 503       // 服务繁忙
}
```

## 2. 认证接口

### 2.1 用户登录
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **请求参数**:
  ```typescript
  interface LoginRequest {
    username: string;
    password: string;
    remember?: boolean;
  }
  ```
- **响应数据**:
  ```typescript
  interface LoginResponse {
    token: string;
    user: {
      id: string;
      username: string;
      role: string;
    }
  }
  ```
- **错误码**:
  - `400`: 用户名或密码错误
  - `403`: 账号已被禁用
  - `429`: 登录请求过于频繁

### 2.2 用户注册
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **请求参数**:
  ```typescript
  interface RegisterRequest {
    username: string;
    password: string;
    email: string;
  }
  ```
- **响应数据**: 同登录接口

### 2.3 退出登录
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **请求头**:
  ```typescript
  {
    Authorization: 'Bearer ${token}'
  }
  ```
- **响应数据**: 
  ```typescript
  {
    code: 200,
    message: "退出成功"
  }
  ```

### 2.4 获取当前用户信息
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **请求头**: 需要认证
- **响应数据**:
  ```typescript
  interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
  }
  ```

## 3. 管理员接口

### 3.1 用户管理
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **请求参数**:
  ```typescript
  interface UserQueryParams extends PaginationParams {
    keyword?: string;
    status?: 'active' | 'inactive';
    role?: string;
  }
  ```
- **响应数据**: `PaginatedResponse<User>`

### 3.2 封禁用户
- **URL**: `/api/admin/users/:userId/ban`
- **Method**: `POST`
- **请求头**: 需要管理员权限
- **响应数据**:
  ```typescript
  {
    code: 200,
    message: "用户已封禁"
  }
  ```

## 4. 安全规范

### 4.1 认证规范
- 所有需要认证的接口必须在请求头中携带 token
- Token 格式: `Bearer ${token}`
- Token 过期时间: 24小时
- 刷新 Token 机制: 过期前30分钟可请求刷新

### 4.2 权限控制
```typescript
// 权限检查中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
```

### 4.3 请求限流
- 登录接口: 每IP每分钟最多5次
- 普通接口: 每IP每分钟最多60次
- 管理接口: 每IP每分钟最多30次

## 5. 错误处理

### 5.1 错误响应格式
```typescript
interface ApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}
```

### 5.2 错误处理最佳实践
```typescript
try {
  const response = await request.post('/api/auth/login', loginData);
  return response.data;
} catch (error) {
  if (error.response) {
    const apiError = error as ApiError;
    switch (apiError.code) {
      case 400:
        throw new Error('请求参数错误');
      case 401:
        throw new Error('未授权，请重新登录');
      case 403:
        throw new Error('无权访问');
      default:
        throw new Error('服务器错误，请稍后重试');
    }
  }
  throw new Error('网络错误，请检查网络连接');
}
```

## 6. 性能优化

### 6.1 缓存策略
```typescript
// 配置缓存
const config: HttpRequestConfig = {
  cache: {
    enable: true,
    ttl: 300000, // 5分钟缓存
    key: 'user-profile'
  }
};

// 使用缓存
const response = await request.get('/api/users/profile', config);
```

### 6.2 请求优化
- 支持请求取消
- 支持请求重试
- 支持请求队列
- 支持并发请求控制

### 6.3 数据压缩
- 响应数据使用 gzip 压缩
- 大文件传输使用分片上传
- 图片使用 WebP 格式

## 7. 监控和日志

### 7.1 性能监控
```typescript
// 记录API调用性能
performanceMonitor.trackApiCall(
  url,
  duration,
  success
);
```

### 7.2 审计日志
```typescript
interface AuditLog {
  id: string;
  timestamp: number;
  type: AuditLogType;
  level: AuditLogLevel;
  userId?: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}
``` 