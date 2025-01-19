import { RegisterFormData } from '@/types/auth';
import React from 'react';
import AuthForm from './AuthForm';

interface RegisterFormProps {
  formData?: RegisterFormData;
  showPassword?: boolean;
  disabled?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  onFormChange?: (data: Partial<RegisterFormData>) => void;
  onTogglePassword?: () => void;
}

const defaultProps: Required<RegisterFormProps> = {
  formData: { 
    username: '', 
    password: '', 
    email: '', 
    confirmPassword: '' 
  },
  showPassword: false,
  disabled: false,
  onSubmit: () => {},
  onFormChange: () => {},
  onTogglePassword: () => {}
};

const RegisterForm: React.FC<RegisterFormProps> = (props) => {
  const finalProps = { ...defaultProps, ...props };
  return (
    <AuthForm
      type="register"
      formData={finalProps.formData}
      showPassword={finalProps.showPassword}
      disabled={finalProps.disabled}
      onSubmit={finalProps.onSubmit}
      onFormChange={finalProps.onFormChange}
      onTogglePassword={finalProps.onTogglePassword}
    />
  );
};

export default RegisterForm; 