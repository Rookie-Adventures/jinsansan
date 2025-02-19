import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import type { ChangeEvent, FC, FormEvent } from 'react';

import { LoginFormData, RegisterFormData } from '@/types/auth';

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
}) => (
  <Box
    component="form"
    onSubmit={(_event: FormEvent<HTMLFormElement>) => {
      _event.preventDefault();
      onSubmit(_event);
    }}
    data-testid="auth-form"
  >
    <FormHeader type={type} />

    <TextField
      fullWidth
      label="用户名"
      variant="outlined"
      margin="normal"
      value={formData.username}
      disabled={disabled}
      onChange={(_e: ChangeEvent<HTMLInputElement>) => onFormChange({ username: _e.target.value })}
    />

    {type === 'register' && (
      <TextField
        fullWidth
        label="邮箱"
        type="email"
        variant="outlined"
        margin="normal"
        value={(formData as RegisterFormData).email}
        disabled={disabled}
        onChange={(_e: ChangeEvent<HTMLInputElement>) => onFormChange({ email: _e.target.value })}
      />
    )}

    <PasswordField
      label="密码"
      value={formData.password}
      showPassword={showPassword}
      disabled={disabled}
      onChange={(_value: string) => onFormChange({ password: _value })}
      onTogglePassword={onTogglePassword}
    />

    {type === 'register' && (
      <PasswordField
        label="确认密码"
        value={(formData as RegisterFormData).confirmPassword || ''}
        showPassword={showPassword}
        disabled={disabled}
        onChange={(_value: string) => onFormChange({ confirmPassword: _value })}
        onTogglePassword={onTogglePassword}
      />
    )}

    <Button
      type="submit"
      fullWidth
      variant="contained"
      size="large"
      disabled={disabled}
      sx={{ mt: 3 }}
    >
      {type === 'login' ? '登录' : '注册'}
    </Button>
  </Box>
);

export default AuthForm;
