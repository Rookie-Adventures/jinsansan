# 后端中间件使用文档

## Auth Middleware
处理用户认证的中间件。

### 示例
```javascript
app.use(authMiddleware);
```

## Error Middleware
处理错误的中间件。

### 示例
```javascript
app.use(errorMiddleware);
```

## Logger Middleware
记录请求和响应的日志。

### 示例
```javascript
app.use(loggerMiddleware);
```

## Role Middleware
处理用户角色的权限验证。

### 示例
```javascript
app.use(roleMiddleware);
``` 