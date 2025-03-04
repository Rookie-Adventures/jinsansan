# 安全模块 (Security)

## 目录结构
```
security/
├── audit.ts       # 安全审计
├── auth.ts        # 认证安全
├── csrf.ts        # CSRF 防护
├── encryption.ts  # 加密工具
├── policy.ts      # 安全策略
├── rbac.ts        # 权限控制
└── __tests__/     # 测试文件
```

## 功能特性

### 1. CSRF 防护
- Token 生成和验证
- 请求头注入
- Token 刷新机制
- 异常处理

### 2. 密码加密
- 密码哈希
- 盐值生成
- 加密算法配置
- 密钥管理

### 3. 请求限流
- 基于 IP 的限流
- 基于用户的限流
- 滑动窗口算法
- 限流策略配置

### 4. 安全审计
- 操作日志记录
- 安全事件追踪
- 异常行为检测
- 审计报告生成

### 5. 权限控制
- 基于角色的访问控制
- 权限验证
- 权限缓存
- 动态权限更新

## 使用示例

### CSRF 防护
```typescript
import { csrfTokenManager } from './csrf';

// 生成 CSRF Token
const token = csrfTokenManager.generateToken();

// 验证 CSRF Token
const isValid = csrfTokenManager.validateToken(token);

// 获取 CSRF Header
const headerKey = csrfTokenManager.getHeaderKey();
```

### 密码加密
```typescript
import { encryptionManager } from './encryption';

// 加密数据
const encrypted = encryptionManager.encrypt(data, secret);

// 解密数据
const decrypted = encryptionManager.decrypt(encrypted, secret);

// 生成密码哈希
const hash = encryptionManager.hash(password);

// 验证密码
const isValid = encryptionManager.verifyHash(password, hash);
```

### 请求限流
```typescript
import { securityPolicyManager } from './policy';

// 检查请求是否被限流
const isAllowed = securityPolicyManager.checkRateLimit(ip);

// 更新限流策略
securityPolicyManager.updatePolicy({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制100次请求
  }
});
```

### 安全审计
```typescript
import { auditManager } from './audit';

// 记录安全事件
auditManager.logEvent({
  type: 'SECURITY',
  action: 'LOGIN_ATTEMPT',
  context: {
    ip: '127.0.0.1',
    user: 'test'
  }
});

// 获取审计日志
const logs = auditManager.getLogs({
  type: 'SECURITY',
  startTime: Date.now() - 24 * 60 * 60 * 1000
});
```

### 权限控制
```typescript
import { rbacManager } from './rbac';

// 检查权限
const hasPermission = rbacManager.checkPermission(
  userId,
  'READ',
  'document'
);

// 分配角色
rbacManager.assignRole(userId, 'admin');

// 检查角色
const hasRole = rbacManager.hasRole(userId, 'admin');
```

## 安全策略

### 1. 密码策略
```typescript
const passwordPolicy = {
  minLength: 8,
  maxLength: 32,
  requireNumber: true,
  requireLetter: true,
  requireSpecialChar: true,
  requireUppercase: true,
  requireLowercase: true
};
```

### 2. 会话策略
```typescript
const sessionPolicy = {
  tokenExpiration: 24 * 60 * 60 * 1000, // 24小时
  refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7天
  maxConcurrentSessions: 3,
  idleTimeout: 30 * 60 * 1000 // 30分钟
};
```

### 3. 请求策略
```typescript
const requestPolicy = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  cors: {
    origin: ['https://example.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};
```

### 4. 审计策略
```typescript
const auditPolicy = {
  retentionDays: 90,
  sensitiveFields: ['password', 'token'],
  logLevels: ['INFO', 'WARN', 'ERROR'],
  eventTypes: ['SECURITY', 'AUTH', 'ACCESS']
};
```

## 测试说明

### 1. 单元测试
- 加密算法测试
- Token 验证测试
- 限流算法测试
- 权限检查测试

### 2. 安全测试
- CSRF 防护测试
- XSS 防护测试
- SQL 注入测试
- 权限绕过测试

### 3. 性能测试
- 加密性能测试
- 限流性能测试
- 审计性能测试
- 并发测试

## 最佳实践

### 1. 安全实现
- 使用安全的加密算法
- 实现完整的验证
- 添加安全头部
- 使用 HTTPS

### 2. 性能优化
- 缓存 Token
- 优化加密操作
- 异步审计日志
- 批量权限检查

### 3. 错误处理
- 优雅降级
- 错误日志
- 异常恢复
- 用户提示

### 4. 监控告警
- 异常监控
- 性能监控
- 安全告警
- 审计报告

## 更新日志

### v1.0.0
- 初始化安全模块
- 实现基础安全特性
- 添加安全策略
- 完善测试用例

### v1.1.0
- 增强加密算法
- 优化限流策略
- 改进审计功能
- 添加监控告警 