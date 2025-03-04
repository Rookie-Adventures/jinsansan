import type { User } from './user';

export type { User };

export type LoginMethod = 'username' | 'phone' | 'email';

export interface BaseLoginFormData {
  rememberMe?: boolean;
}

export interface UsernameLoginFormData extends BaseLoginFormData {
  loginMethod: 'username';
  username: string;
  password: string;
}

export interface PhoneLoginFormData extends BaseLoginFormData {
  loginMethod: 'phone';
  phone: string;
  verificationCode: string;
}

export interface EmailLoginFormData extends BaseLoginFormData {
  loginMethod: 'email';
  email: string;
  verificationCode: string;
}

export type LoginFormData = UsernameLoginFormData | PhoneLoginFormData | EmailLoginFormData;

export interface RegisterFormData {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
