import type { LoginFormData, RegisterFormData } from '@/types/auth';

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// 用户名验证规则
const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_-]+$/,
};

// 密码验证规则
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 32,
  requireNumber: true,
  requireLetter: true,
  requireSpecialChar: true,
};

// 验证密码强度
const validatePasswordStrength = (password: string): ValidationResult => {
  if (password.length < PASSWORD_RULES.minLength) {
    return {
      isValid: false,
      errorMessage: `密码长度不能少于${PASSWORD_RULES.minLength}个字符`,
    };
  }

  if (password.length > PASSWORD_RULES.maxLength) {
    return {
      isValid: false,
      errorMessage: `密码长度不能超过${PASSWORD_RULES.maxLength}个字符`,
    };
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      errorMessage: '密码必须包含数字',
    };
  }

  if (PASSWORD_RULES.requireLetter && !/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      errorMessage: '密码必须包含字母',
    };
  }

  if (PASSWORD_RULES.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      errorMessage: '密码必须包含特殊字符',
    };
  }

  return { isValid: true };
};

// 验证用户名格式
const validateUsername = (username: string): ValidationResult => {
  if (!username.trim()) {
    return {
      isValid: false,
      errorMessage: '请输入用户名',
    };
  }

  if (username.length < USERNAME_RULES.minLength) {
    return {
      isValid: false,
      errorMessage: `用户名长度不能少于${USERNAME_RULES.minLength}个字符`,
    };
  }

  if (username.length > USERNAME_RULES.maxLength) {
    return {
      isValid: false,
      errorMessage: `用户名长度不能超过${USERNAME_RULES.maxLength}个字符`,
    };
  }

  if (!USERNAME_RULES.pattern.test(username)) {
    return {
      isValid: false,
      errorMessage: '用户名只能包含字母、数字、下划线和连字符',
    };
  }

  return { isValid: true };
};

export const validateLoginForm = (formData: LoginFormData): ValidationResult => {
  switch (formData.loginMethod) {
    case 'username': {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        return usernameValidation;
      }

      if (!formData.password) {
        return {
          isValid: false,
          errorMessage: '请输入密码',
        };
      }

      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        return passwordValidation;
      }
      break;
    }
    case 'phone': {
      if (!formData.phone) {
        return {
          isValid: false,
          errorMessage: '请输入手机号',
        };
      }

      const phonePattern = /^1[3-9]\d{9}$/;
      if (!phonePattern.test(formData.phone)) {
        return {
          isValid: false,
          errorMessage: '请输入有效的手机号',
        };
      }

      if (!formData.verificationCode) {
        return {
          isValid: false,
          errorMessage: '请输入验证码',
        };
      }

      if (!/^\d{6}$/.test(formData.verificationCode)) {
        return {
          isValid: false,
          errorMessage: '验证码必须是6位数字',
        };
      }
      break;
    }
    case 'email': {
      if (!formData.email) {
        return {
          isValid: false,
          errorMessage: '请输入邮箱',
        };
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        return {
          isValid: false,
          errorMessage: '请输入有效的邮箱地址',
        };
      }

      if (!formData.verificationCode) {
        return {
          isValid: false,
          errorMessage: '请输入验证码',
        };
      }

      if (!/^\d{6}$/.test(formData.verificationCode)) {
        return {
          isValid: false,
          errorMessage: '验证码必须是6位数字',
        };
      }
      break;
    }
  }

  return { isValid: true };
};

export const validateRegisterForm = (formData: RegisterFormData): ValidationResult => {
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }

  const passwordValidation = validatePasswordStrength(formData.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  if (formData.password !== formData.confirmPassword) {
    return {
      isValid: false,
      errorMessage: '两次输入的密码不一致',
    };
  }

  if (!formData.email) {
    return {
      isValid: false,
      errorMessage: '请输入邮箱',
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    return {
      isValid: false,
      errorMessage: '请输入有效的邮箱地址',
    };
  }

  return { isValid: true };
};
