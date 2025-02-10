import { LoginFormData, RegisterFormData } from '@/types/auth';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateLoginForm = (formData: LoginFormData): ValidationResult => {
  if (!formData.username.trim()) {
    return {
      isValid: false,
      errorMessage: '请输入用户名',
    };
  }

  if (!formData.password) {
    return {
      isValid: false,
      errorMessage: '请输入密码',
    };
  }

  return { isValid: true };
};

export const validateRegisterForm = (formData: RegisterFormData): ValidationResult => {
  if (!formData.username.trim()) {
    return {
      isValid: false,
      errorMessage: '请输入用户名',
    };
  }

  if (!formData.email.trim()) {
    return {
      isValid: false,
      errorMessage: '请输入邮箱',
    };
  }

  if (!formData.password) {
    return {
      isValid: false,
      errorMessage: '请输入密码',
    };
  }

  if (!formData.confirmPassword) {
    return {
      isValid: false,
      errorMessage: '请确认密码',
    };
  }

  if (formData.password !== formData.confirmPassword) {
    return {
      isValid: false,
      errorMessage: '两次输入的密码不一致',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return {
      isValid: false,
      errorMessage: '请输入有效的邮箱地址',
    };
  }

  return { isValid: true };
};
