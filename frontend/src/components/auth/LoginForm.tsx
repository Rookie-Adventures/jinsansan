import type { FC, FormEvent } from 'react';

import { LoginFormData, UsernameLoginFormData } from '@/types/auth';

import AuthForm from './AuthForm';

interface LoginFormProps {
  formData?: LoginFormData;
  showPassword?: boolean;
  disabled?: boolean;
  onSubmit?: (e: FormEvent) => void;
  onFormChange?: (data: Partial<LoginFormData>) => void;
  onTogglePassword?: () => void;
  onCancel?: () => void;
}

const defaultProps: Required<LoginFormProps> = {
  formData: {
    loginMethod: 'username',
    username: '',
    password: '',
    rememberMe: false,
  } as UsernameLoginFormData,
  showPassword: false,
  disabled: false,
  onSubmit: () => {},
  onFormChange: () => {},
  onTogglePassword: () => {},
  onCancel: () => {},
};

const LoginForm: FC<LoginFormProps> = props => {
  const finalProps = { ...defaultProps, ...props };
  return (
    <AuthForm
      type="login"
      formData={finalProps.formData}
      showPassword={finalProps.showPassword}
      disabled={finalProps.disabled}
      onSubmit={finalProps.onSubmit}
      onFormChange={finalProps.onFormChange}
      onTogglePassword={finalProps.onTogglePassword}
      onCancel={finalProps.onCancel}
    />
  );
};

export default LoginForm;
