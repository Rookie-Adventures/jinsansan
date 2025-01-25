import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';

import { LoginFormData, RegisterFormData } from '@/types/auth';

type FormType = 'login' | 'register';
type FormData = LoginFormData | RegisterFormData;

interface AuthFormProps {
  type: FormType;
  formData: FormData;
  showPassword: boolean;
  disabled?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<FormData>) => void;
  onTogglePassword: () => void;
}

const FormHeader: React.FC<{ type: FormType }> = ({ type }) => (
  <>
    <Typography variant="h4" component="h1" gutterBottom align="center">
      {type === 'login' ? '登录' : '注册'}
    </Typography>
    <Typography color="textSecondary" align="center" sx={{ mb: 4 }}>
      {type === 'login' ? '欢迎回来！请登录您的账号' : '创建您的账号'}
    </Typography>
  </>
);

const PasswordField: React.FC<{
  label: string;
  value: string;
  showPassword: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onTogglePassword: () => void;
}> = ({ label, value, showPassword, disabled, onChange, onTogglePassword }) => (
  <TextField
    fullWidth
    label={label}
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    margin="normal"
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
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

const AuthForm: React.FC<AuthFormProps> = ({
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
    onSubmit={onSubmit}
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
      onChange={(e) => onFormChange({ username: e.target.value })}
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
        onChange={(e) => onFormChange({ email: e.target.value })}
      />
    )}

    <PasswordField
      label="密码"
      value={formData.password}
      showPassword={showPassword}
      disabled={disabled}
      onChange={(value) => onFormChange({ password: value })}
      onTogglePassword={onTogglePassword}
    />

    {type === 'register' && (
      <PasswordField
        label="确认密码"
        value={(formData as RegisterFormData).confirmPassword || ''}
        showPassword={showPassword}
        disabled={disabled}
        onChange={(value) => onFormChange({ confirmPassword: value })}
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