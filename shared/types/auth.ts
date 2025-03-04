import { AUTH_CONSTANTS } from '../constants/auth';

export interface User {
  id: string;
  username: string;
  email: string;
  role: keyof typeof AUTH_CONSTANTS.ROLES;
  permissions: Array<keyof typeof AUTH_CONSTANTS.PERMISSIONS>;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  role: keyof typeof AUTH_CONSTANTS.ROLES;
  permissions: Array<keyof typeof AUTH_CONSTANTS.PERMISSIONS>;
  iat: number;
  exp: number;
} 