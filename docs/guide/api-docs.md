# API 文档规范

> 状态：🚧 开发中
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] 接口规范定义 (100%)
> - [x] 基础示例代码 (100%)
> - [ ] 具体业务接口文档 (30%)
> - [ ] 错误处理文档 (50%)
> - [ ] 安全规范 (0%)

## 1. 接口规范

### 请求格式
```typescript
interface ApiRequest<T> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  data?: T;
  headers?: Record<string, string>;
}
```

### 响应格式
```typescript
interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 提示信息
  data: T;            // 响应数据
  timestamp: number;   // 时间戳
}
```

### 状态码定义
```typescript
enum ApiCode {
  SUCCESS = 200,           // 成功
  PARAM_ERROR = 400,       // 参数错误
  UNAUTHORIZED = 401,      // 未授权
  FORBIDDEN = 403,         // 禁止访问
  NOT_FOUND = 404,        // 资源不存在
  SERVER_ERROR = 500,      // 服务器错误
  SERVICE_BUSY = 503       // 服务繁忙
}
```

## 2. 接口文档模板

### 用户模块

#### 2.1 用户登录
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

#### 2.2 用户信息
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **请求头**:
  ```typescript
  {
    Authorization: 'Bearer ${token}'
  }
  ```
- **响应数据**:
  ```typescript
  interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
  }
  ```

## 3. 接口使用示例

### 使用 HTTP 客户端
```typescript
// 登录请求
const login = async (username: string, password: string) => {
  const response = await request.post<LoginResponse>('/auth/login', {
    username,
    password
  });
  return response.data;
};

// 获取用户信息
const getUserProfile = async () => {
  const response = await request.get<UserProfile>('/users/profile');
  return response.data;
};
```

## 4. 最佳实践

### 4.1 错误处理
```typescript
try {
  const response = await request.post('/auth/login', loginData);
  // 处理成功响应
} catch (error) {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        // 处理参数错误
        break;
      case 401:
        // 处理未授权
        break;
      // ... 其他错误处理
    }
  }
}
```

### 4.2 请求取消
```typescript
const controller = new AbortController();
const response = await request.get('/users/profile', {
  signal: controller.signal
});

// 取消请求
controller.abort();
```

### 4.3 并发请求
```typescript
const [userProfile, userSettings] = await Promise.all([
  request.get('/users/profile'),
  request.get('/users/settings')
]);
```

## 5. 版本控制

### 5.1 API版本号
- 在URL中使用: `/api/v1/users`
- 在请求头中使用: `Accept: application/vnd.api.v1+json`

### 5.2 版本兼容性
- 向下兼容原则
- 弃用通知机制
- 过渡期支持 