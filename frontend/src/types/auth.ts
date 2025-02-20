import type { User } from './user';

export type { User };

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
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
