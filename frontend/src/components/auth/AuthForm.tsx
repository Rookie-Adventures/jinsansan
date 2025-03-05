import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField, Typography, Tabs, Tab, Stack, Link, LinearProgress } from '@mui/material';
import { useState } from 'react';

import type { ChangeEvent, FC, FormEvent } from 'react';

import { authApi } from '@/services/auth';
import { LoginFormData, LoginMethod, RegisterFormData, UsernameLoginFormData, PhoneLoginFormData, EmailLoginFormData } from '@/types/auth';

type FormType = 'login' | 'register';

/**
 * 认证表单属性接口
 */
interface AuthFormProps {
  /** 表单类型：登录或注册 */
  type: FormType;
  /** 表单数据 */
  formData: LoginFormData | RegisterFormData;
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
  onFormChange: (formData: Partial<LoginFormData | RegisterFormData>) => void;
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
 * 验证码输入字段组件
 */
interface VerificationCodeFieldProps {
  value: string;
  disabled?: boolean;
  onSendCode: () => void;
  countdown: number;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const VerificationCodeField: FC<VerificationCodeFieldProps> = ({
  value,
  disabled,
  onSendCode,
  countdown,
  onChange,
  error,
  helperText,
}) => (
  <Box>
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <TextField
        fullWidth
        label="验证码"
        variant="outlined"
        margin="normal"
        value={value}
        disabled={disabled}
        error={error}
        helperText={helperText}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value.replace(/\D/g, '').slice(0, 6);
          onChange(newValue);
        }}
        inputProps={{ maxLength: 6 }}
      />
      <Button
        variant="outlined"
        disabled={disabled || countdown > 0}
        onClick={onSendCode}
        sx={{ mt: 2, minWidth: 120 }}
      >
        {countdown > 0 ? `${countdown}s` : '发送验证码'}
      </Button>
    </Stack>
  </Box>
);

/**
 * 密码强度提示组件
 */
interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return Math.min(strength, 5);
  };

  const strength = calculateStrength(password);
  const strengthText = ['非常弱', '弱', '中等', '强', '非常强'][strength - 1] || '未设置';
  const strengthColor = ['error', 'error', 'warning', 'info', 'success'][strength - 1] || 'primary';

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(strength / 5) * 100}
        color={strengthColor as 'error' | 'warning' | 'info' | 'success' | 'primary'}
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
        密码强度：{strengthText}
      </Typography>
    </Box>
  );
};

/**
 * 手机号输入字段组件
 */
interface PhoneFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const PhoneField: FC<PhoneFieldProps> = ({
  value,
  disabled,
  onChange,
  error,
  helperText,
}) => (
  <TextField
    fullWidth
    label="手机号"
    variant="outlined"
    margin="normal"
    value={value}
    disabled={disabled}
    autoComplete="tel"
    error={error}
    helperText={helperText}
    onChange={(e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    }}
    inputProps={{ 
      maxLength: 11,
      inputMode: 'numeric',
      pattern: '[0-9]*'
    }}
  />
);

/**
 * 邮箱输入字段组件
 */
interface EmailFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const EmailField: FC<EmailFieldProps> = ({
  value,
  disabled,
  onChange,
  error,
  helperText,
}) => (
  <TextField
    fullWidth
    label="邮箱"
    type="email"
    variant="outlined"
    margin="normal"
    value={value}
    disabled={disabled}
    autoComplete="email"
    error={error}
    helperText={helperText}
    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
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
  onCancel,
}) => {
  const currentLoginMethod = (formData as LoginFormData).loginMethod || 'username';
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneHelperText, setPhoneHelperText] = useState('');
  const [emailHelperText, setEmailHelperText] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState(false);
  const [verificationCodeHelperText, setVerificationCodeHelperText] = useState('');

  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneHelperText('请输入手机号');
      setPhoneError(true);
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneHelperText('请输入正确的手机号');
      setPhoneError(true);
      return false;
    }
    setPhoneHelperText('');
    setPhoneError(false);
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailHelperText('请输入邮箱地址');
      setEmailError(true);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailHelperText('请输入正确的邮箱地址');
      setEmailError(true);
      return false;
    }
    setEmailHelperText('');
    setEmailError(false);
    return true;
  };

  const validateVerificationCode = (code: string): boolean => {
    if (!code) {
      setVerificationCodeHelperText('请输入验证码');
      setVerificationCodeError(true);
      return false;
    }
    if (!/^\d{6}$/.test(code)) {
      setVerificationCodeHelperText('验证码必须是6位数字');
      setVerificationCodeError(true);
      return false;
    }
    setVerificationCodeHelperText('');
    setVerificationCodeError(false);
    return true;
  };

  const handleLoginMethodChange = (method: LoginMethod) => {
    // 根据不同的登录方式，只清空相关字段
    const baseChange = {
      loginMethod: method,
    };

    // 重置错误状态
    setPhoneError(false);
    setEmailError(false);
    setPhoneHelperText('');
    setEmailHelperText('');
    setVerificationCodeError(false);
    setVerificationCodeHelperText('');

    // 如果正在倒计时，不清空验证码
    const verificationCode = countdown > 0 ? (formData as PhoneLoginFormData | EmailLoginFormData).verificationCode : '';

    switch (method) {
      case 'username':
        onFormChange({
          ...baseChange,
          username: '',
          password: '',
        });
        break;
      case 'phone':
        onFormChange({
          ...baseChange,
          phone: '',
          verificationCode,
        });
        break;
      case 'email':
        onFormChange({
          ...baseChange,
          email: '',
          verificationCode,
        });
        break;
    }
  };

  const handlePhoneChange = (value: string) => {
    const newValue = value.replace(/\D/g, '').slice(0, 11);
    onFormChange({ phone: newValue });
    validatePhone(newValue);
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;

    let isValid = true;
    let target = '';
    let verificationType: 'phone' | 'email';

    if (currentLoginMethod === 'phone') {
      const phone = (formData as PhoneLoginFormData).phone;
      isValid = validatePhone(phone);
      target = phone;
      verificationType = 'phone';
    } else if (currentLoginMethod === 'email') {
      const email = (formData as EmailLoginFormData).email;
      isValid = validateEmail(email);
      target = email;
      verificationType = 'email';
    } else {
      return; // 用户名登录方式不需要发送验证码
    }

    if (!isValid) return;

    try {
      // 调用发送验证码的 API
      await authApi.sendVerificationCode({
        type: verificationType,
        target,
      });

      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // 处理错误
      const errorMessage = error instanceof Error ? error.message : '发送验证码失败，请重试';
      setVerificationCodeError(true);
      setVerificationCodeHelperText(errorMessage);
    }
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
            <>
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
              <PasswordField
                label="密码"
                value={(formData as UsernameLoginFormData).password}
                showPassword={showPassword}
                disabled={disabled}
                autoComplete="current-password"
                onChange={(_value: string) => onFormChange({ password: _value })}
                onTogglePassword={onTogglePassword}
              />
            </>
          )}

          {currentLoginMethod === 'phone' && (
            <>
              <PhoneField
                value={(formData as PhoneLoginFormData).phone || ''}
                disabled={disabled}
                onChange={handlePhoneChange}
                error={phoneError}
                helperText={phoneHelperText}
              />
              <VerificationCodeField
                value={(formData as PhoneLoginFormData).verificationCode || ''}
                disabled={disabled}
                onSendCode={handleSendCode}
                countdown={countdown}
                onChange={(value) => {
                  onFormChange({ verificationCode: value });
                  validateVerificationCode(value);
                }}
                error={verificationCodeError}
                helperText={verificationCodeHelperText}
              />
            </>
          )}

          {currentLoginMethod === 'email' && (
            <>
              <EmailField
                value={(formData as EmailLoginFormData).email || ''}
                disabled={disabled}
                onChange={(value) => {
                  onFormChange({ email: value });
                  validateEmail(value);
                }}
                error={emailError}
                helperText={emailHelperText}
              />
              <VerificationCodeField
                value={(formData as EmailLoginFormData).verificationCode || ''}
                disabled={disabled}
                onSendCode={handleSendCode}
                countdown={countdown}
                onChange={(value) => {
                  onFormChange({ verificationCode: value });
                  validateVerificationCode(value);
                }}
                error={verificationCodeError}
                helperText={verificationCodeHelperText}
              />
            </>
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

      {type === 'register' && (
        <>
          <PasswordField
            label="密码"
            value={(formData as RegisterFormData).password}
            showPassword={showPassword}
            disabled={disabled}
            autoComplete="new-password"
            onChange={(_value: string) => onFormChange({ password: _value })}
            onTogglePassword={onTogglePassword}
          />
          <PasswordField
            label="确认密码"
            value={(formData as RegisterFormData).confirmPassword}
            showPassword={showPassword}
            disabled={disabled}
            autoComplete="new-password"
            onChange={(_value: string) => onFormChange({ confirmPassword: _value })}
            onTogglePassword={onTogglePassword}
          />
          <PasswordStrength password={(formData as RegisterFormData).password} />
        </>
      )}

      {type === 'login' && currentLoginMethod === 'username' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
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
          <Link
            href="/forgot-password"
            variant="body2"
            sx={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              // TODO: 处理忘记密码
            }}
          >
            忘记密码？
          </Link>
        </Box>
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
