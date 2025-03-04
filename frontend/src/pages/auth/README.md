# 认证模块 (Auth)

## 目录结构
```
auth/
├── components/     # 认证相关组件
│   ├── AuthCard.tsx       # 认证卡片容器
│   ├── AuthForm.tsx       # 认证表单组件
│   ├── AuthPage.tsx       # 认证页面布局
│   ├── LoginForm.tsx      # 登录表单
│   └── RegisterForm.tsx   # 注册表单
├── hooks/         # 认证相关 hooks
│   ├── useAuth.ts        # 认证状态管理
│   └── useAuthForm.ts    # 认证表单管理
├── services/      # 认证服务
│   ├── authService.ts    # 认证服务
│   └── tokenService.ts   # Token 管理
├── utils/         # 认证工具
│   ├── validation.ts     # 表单验证
│   └── security.ts       # 安全工具
└── __tests__/     # 测试文件
```

## 功能特性

### 1. 用户认证
- 用户名/密码登录
- 手机号验证码登录
- 邮箱验证码登录
- 第三方登录（待实现）

### 2. 用户注册
- 用户名注册
- 邮箱验证
- 手机号验证
- 密码强度检测

### 3. 会话管理
- Token 管理
- 会话持久化
- 自动登录
- 会话超时

### 4. 安全特性
- CSRF 防护
- XSS 防护
- 密码加密
- 请求限流
- 防暴力破解

## 组件说明

### AuthPage
认证页面布局组件，提供统一的页面结构和样式。

```typescript
interface AuthPageProps {
  type: 'login' | 'register';
  children: ReactNode;
  initialData?: LoginFormData | RegisterFormData;
}
```

### AuthForm
认证表单组件，处理表单逻辑和验证。

```typescript
interface AuthFormProps {
  type: 'login' | 'register';
  formData: LoginFormData | RegisterFormData;
  onSubmit: (data: LoginFormData | RegisterFormData) => void;
  onCancel?: () => void;
}
```

### LoginForm
登录表单组件，支持多种登录方式。

```typescript
interface LoginFormProps {
  initialData?: LoginFormData;
  onSubmit: (data: LoginFormData) => void;
  onCancel?: () => void;
}
```

### RegisterForm
注册表单组件，包含完整的注册流程。

```typescript
interface RegisterFormProps {
  initialData?: RegisterFormData;
  onSubmit: (data: RegisterFormData) => void;
  onCancel?: () => void;
}
```

## 使用示例

### 登录页面
```typescript
import { useAuth } from '@/hooks/auth';
import { LoginForm } from '@/components/auth';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // 登录成功后的处理
    } catch (error) {
      // 错误处理
    }
  };
  
  return (
    <AuthPage type="login">
      <LoginForm 
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </AuthPage>
  );
};
```

### 注册页面
```typescript
import { useAuth } from '@/hooks/auth';
import { RegisterForm } from '@/components/auth';

const RegisterPage = () => {
  const { register, loading, error } = useAuth();
  
  const handleSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      // 注册成功后的处理
    } catch (error) {
      // 错误处理
    }
  };
  
  return (
    <AuthPage type="register">
      <RegisterForm 
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </AuthPage>
  );
};
```

## 安全考虑

### 1. 密码安全
- 密码强度要求
- 密码加密存储
- 密码传输加密
- 密码重置机制

### 2. 会话安全
- Token 有效期管理
- 会话超时处理
- 并发登录控制
- 异常登录检测

### 3. 请求安全
- CSRF 防护
- XSS 防护
- 请求限流
- 请求签名

### 4. 数据安全
- 敏感数据加密
- 数据验证
- 数据清理
- 错误处理

## 测试说明

### 1. 单元测试
- 组件渲染测试
- 表单验证测试
- 状态管理测试
- 工具函数测试

### 2. 集成测试
- 登录流程测试
- 注册流程测试
- 会话管理测试
- 错误处理测试

### 3. E2E 测试
- 用户操作测试
- 安全特性测试
- 性能测试
- 兼容性测试

## 最佳实践

### 1. 组件开发
- 遵循单一职责原则
- 使用 TypeScript 类型
- 实现错误边界
- 添加加载状态

### 2. 状态管理
- 使用 Redux Toolkit
- 实现状态持久化
- 优化状态更新
- 处理异步操作

### 3. 安全实现
- 实现完整的验证
- 添加安全头部
- 使用 HTTPS
- 实现日志记录

### 4. 性能优化
- 组件懒加载
- 状态缓存
- 请求优化
- 资源压缩

## 更新日志

### v1.0.0
- 初始化认证模块
- 实现基础认证功能
- 添加安全特性
- 完善测试用例

### v1.1.0
- 添加第三方登录
- 优化表单验证
- 增强安全特性
- 改进错误处理 