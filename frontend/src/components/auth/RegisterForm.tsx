import type { FC, FormEvent } from 'react';

import { RegisterFormData, LoginFormData } from '@/types/auth';

import AuthForm from './AuthForm';

interface RegisterFormProps {
  formData?: RegisterFormData;
  showPassword?: boolean;
  disabled?: boolean;
  onSubmit?: (e: FormEvent) => void;
  onFormChange?: (data: Partial<RegisterFormData | LoginFormData>) => void;
  onTogglePassword?: () => void;
}

const defaultProps: Required<RegisterFormProps> = {
  formData: {
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
  },
  showPassword: false,
  disabled: false,
  onSubmit: () => {},
  onFormChange: () => {},
  onTogglePassword: () => {},
};

const RegisterForm: FC<RegisterFormProps> = props => {
  const finalProps = { ...defaultProps, ...props };
  return (
    <AuthForm
      type="register"
      formData={finalProps.formData}
      showPassword={finalProps.showPassword}
      disabled={finalProps.disabled}
      onSubmit={finalProps.onSubmit}
      onFormChange={finalProps.onFormChange as (data: Partial<RegisterFormData | LoginFormData>) => void}
      onTogglePassword={finalProps.onTogglePassword}
    />
  );
};

export default RegisterForm;
