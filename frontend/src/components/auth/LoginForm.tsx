import React from 'react';

import { LoginFormData } from '@/types/auth';

import AuthForm from './AuthForm';

interface LoginFormProps {
  formData?: LoginFormData;
  showPassword?: boolean;
  disabled?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  onFormChange?: (data: Partial<LoginFormData>) => void;
  onTogglePassword?: () => void;
}

const defaultProps: Required<LoginFormProps> = {
  formData: { username: '', password: '' },
  showPassword: false,
  disabled: false,
  onSubmit: () => {},
  onFormChange: () => {},
  onTogglePassword: () => {},
};

const LoginForm: React.FC<LoginFormProps> = props => {
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
    />
  );
};

export default LoginForm;
