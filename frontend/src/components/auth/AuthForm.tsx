import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField, Typography, Tabs, Tab } from '@mui/material';

import type { ChangeEvent, FC, FormEvent } from 'react';

import { LoginFormData, LoginMethod, RegisterFormData, UsernameLoginFormData, PhoneLoginFormData, EmailLoginFormData } from '@/types/auth';

type FormType = 'login' | 'register';
type FormData = LoginFormData | RegisterFormData;

/**
 * 认证表单属性接口
 */
interface AuthFormProps {
  /** 表单类型：登录或注册 */
  type: FormType;
  /** 表单数据 */
  formData: FormData;
  /** 是否显示密码 */
  showPassword: boolean;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 
   * 表单提交处理函数
   * @param e 表单提交事件
   * @remarks 在 LoginForm 和 RegisterForm 中实现具体的提交逻辑
   */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** 
   * 表单数据变更处理函数
   * @param formData 变更的表单数据部分
   * @remarks 用于实现受控组件模式，在父组件中跟踪表单状态
   */
  onFormChange: (formData: Partial<FormData>) => void;
  /** 
   * 密码显示切换处理函数
   * @remarks 控制密码字段的显示/隐藏状态
   */
  onTogglePassword: () => void;
  /** 
   * 取消处理函数
   * @remarks 用于处理取消操作，如取消登录或取消注册
   */
  onCancel?: () => void;
}

/**
 * 表单头部组件
 */
const FormHeader: FC<{ type: FormType }> = ({ type }) => (
  <>
    <Typography variant="h4" component="h1" gutterBottom align="center">
      {type === 'login' ? '登录' : '注册'}
    </Typography>
    <Typography color="textSecondary" align="center" sx={{ mb: 4 }}>
      {type === 'login' ? '欢迎回来！请登录您的账号' : '创建您的账号'}
    </Typography>
  </>
);

/**
 * 密码输入字段组件属性接口
 */
interface PasswordFieldProps {
  /** 字段标签 */
  label: string;
  /** 字段值 */
  value: string;
  /** 是否显示密码 */
  showPassword: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自动完成属性 */
  autoComplete?: string;
  /** 
   * 值变更处理函数
   * @param value 新的密码值
   * @remarks 用于更新父组件中的密码状态
   */
  onChange: (value: string) => void;
  /** 密码显示切换处理函数 */
  onTogglePassword: () => void;
}

/**
 * 密码输入字段组件
 */
const PasswordField: FC<PasswordFieldProps> = ({
  label,
  value,
  showPassword,
  disabled,
  autoComplete,
  onChange,
  onTogglePassword,
}) => (
  <TextField
    fullWidth
    label={label}
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    margin="normal"
    value={value}
    disabled={disabled}
    autoComplete={autoComplete}
    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={onTogglePassword}
            edge="end"
            disabled={disabled}
            data-testid="password-visibility-toggle"
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
);

/**
 * 登录方式切换组件
 */
interface LoginMethodTabsProps {
  currentMethod: LoginMethod;
  onChange: (method: LoginMethod) => void;
  disabled?: boolean;
}

const LoginMethodTabs: FC<LoginMethodTabsProps> = ({ currentMethod, onChange, disabled }) => (
  <Tabs
    value={currentMethod}
    onChange={(_, value: LoginMethod) => onChange(value)}
    sx={{ mb: 2 }}
  >
    <Tab label="用户名登录" value="username" disabled={disabled} />
    <Tab label="手机号登录" value="phone" disabled={disabled} />
    <Tab label="邮箱登录" value="email" disabled={disabled} />
  </Tabs>
);

/**
 * 认证表单组件
 * 用于处理用户登录和注册
 */
const AuthForm: FC<AuthFormProps> = ({
  type,
  formData,
  showPassword,
  disabled,
  onSubmit,
  onFormChange,
  onTogglePassword,
  onCancel,
}) => {
  const currentLoginMethod = (formData as LoginFormData).loginMethod || 'username';

  const handleLoginMethodChange = (method: LoginMethod) => {
    onFormChange({
      loginMethod: method,
      username: '',
      phone: '',
      email: '',
      password: '',
    });
  };

  return (
    <Box
      component="form"
      onSubmit={(_event: FormEvent<HTMLFormElement>) => {
        _event.preventDefault();
        onSubmit(_event);
      }}
      data-testid="auth-form"
      autoComplete={type === 'login' ? 'on' : 'off'}
    >
      <FormHeader type={type} />

      {type === 'login' && (
        <LoginMethodTabs
          currentMethod={currentLoginMethod}
          onChange={handleLoginMethodChange}
          disabled={disabled}
        />
      )}

      {type === 'login' ? (
        <>
          {currentLoginMethod === 'username' && (
            <TextField
              fullWidth
              label="用户名"
              variant="outlined"
              margin="normal"
              value={(formData as UsernameLoginFormData).username || ''}
              disabled={disabled}
              autoComplete="username"
              onChange={(_e: ChangeEvent<HTMLInputElement>) =>
                onFormChange({ username: _e.target.value })
              }
            />
          )}

          {currentLoginMethod === 'phone' && (
            <TextField
              fullWidth
              label="手机号"
              variant="outlined"
              margin="normal"
              value={(formData as PhoneLoginFormData).phone || ''}
              disabled={disabled}
              autoComplete="tel"
              onChange={(_e: ChangeEvent<HTMLInputElement>) =>
                onFormChange({ phone: _e.target.value })
              }
            />
          )}

          {currentLoginMethod === 'email' && (
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              variant="outlined"
              margin="normal"
              value={(formData as EmailLoginFormData).email || ''}
              disabled={disabled}
              autoComplete="email"
              onChange={(_e: ChangeEvent<HTMLInputElement>) =>
                onFormChange({ email: _e.target.value })
              }
            />
          )}
        </>
      ) : (
        <TextField
          fullWidth
          label="用户名"
          variant="outlined"
          margin="normal"
          value={(formData as RegisterFormData).username}
          disabled={disabled}
          autoComplete="username"
          onChange={(_e: ChangeEvent<HTMLInputElement>) =>
            onFormChange({ username: _e.target.value })
          }
        />
      )}

      {type === 'register' && (
        <TextField
          fullWidth
          label="邮箱"
          type="email"
          variant="outlined"
          margin="normal"
          value={(formData as RegisterFormData).email}
          disabled={disabled}
          autoComplete="email"
          onChange={(_e: ChangeEvent<HTMLInputElement>) =>
            onFormChange({ email: _e.target.value })
          }
        />
      )}

      <PasswordField
        label="密码"
        value={formData.password}
        showPassword={showPassword}
        disabled={disabled}
        autoComplete={type === 'login' ? 'current-password' : 'new-password'}
        onChange={(_value: string) => onFormChange({ password: _value })}
        onTogglePassword={onTogglePassword}
      />

      {type === 'register' && (
        <PasswordField
          label="确认密码"
          value={(formData as RegisterFormData).confirmPassword || ''}
          showPassword={showPassword}
          disabled={disabled}
          autoComplete="new-password"
          onChange={(_value: string) => onFormChange({ confirmPassword: _value })}
          onTogglePassword={onTogglePassword}
        />
      )}

      {type === 'login' && (
        <FormControlLabel
          control={
            <Checkbox
              checked={(formData as LoginFormData).rememberMe || false}
              onChange={(_e: ChangeEvent<HTMLInputElement>) =>
                onFormChange({ rememberMe: _e.target.checked })
              }
              disabled={disabled}
              color="primary"
            />
          }
          label="记住密码"
        />
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={disabled}
        >
          {type === 'login' ? '登录' : '注册'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            fullWidth
            variant="outlined"
            size="large"
            disabled={disabled}
            onClick={onCancel}
          >
            取消
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AuthForm;
