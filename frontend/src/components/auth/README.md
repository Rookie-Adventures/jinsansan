# 认证组件使用文档

## AuthForm
登录或注册表单组件。

### 属性
- `type`: 表单类型（登录或注册）。
- `formData`: 表单数据。
- `showPassword`: 是否显示密码。
- `onSubmit`: 表单提交处理函数。
- `onFormChange`: 表单数据变更处理函数。
- `onTogglePassword`: 密码显示切换处理函数。

### 示例
```jsx
<AuthForm type="login" formData={loginData} onSubmit={handleLogin} />
``` 