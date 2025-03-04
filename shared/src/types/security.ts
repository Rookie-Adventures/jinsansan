import { AUTH_CONSTANTS } from '../constants/auth';

export interface SecurityConfig {
  tokenKey: keyof typeof AUTH_CONSTANTS;
  refreshTokenKey: keyof typeof AUTH_CONSTANTS;
  tokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  passwordSaltRounds: number;
  allowedOrigins: string[];
  corsEnabled: boolean;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface TokenConfig {
  secret: string;
  algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface PasswordConfig {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export interface SecurityContext {
  ip: string;
  userAgent: string;
  origin: string;
  timestamp: number;
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'password_change' | 'token_refresh' | 'failed_login';
  userId?: string;
  context: SecurityContext;
  details?: Record<string, any>;
  timestamp: number;
}

export interface SecurityValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface SecurityPolicy {
  name: string;
  description: string;
  rules: Array<{
    type: 'allow' | 'deny';
    action: string;
    resource: string;
    conditions?: Record<string, any>;
  }>;
} 