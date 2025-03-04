import { ERROR_CODES, ERROR_SEVERITY } from '../constants/error';

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type ErrorSeverity = typeof ERROR_SEVERITY[keyof typeof ERROR_SEVERITY];

export interface ErrorDetails {
  field?: string;
  value?: any;
  message?: string;
  [key: string]: any;
}

export interface AppError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: ErrorDetails;
  stack?: string;
  timestamp: number;
}

export interface ValidationError extends AppError {
  code: typeof ERROR_CODES.VALIDATION_ERROR;
  details: {
    field: string;
    value: any;
    message: string;
  };
}

export interface AuthError extends AppError {
  code: typeof ERROR_CODES.UNAUTHORIZED | typeof ERROR_CODES.FORBIDDEN;
  details?: {
    token?: string;
    permissions?: string[];
  };
}

export interface NetworkError extends AppError {
  code: typeof ERROR_CODES.NETWORK_ERROR;
  details?: {
    url?: string;
    method?: string;
    status?: number;
  };
}

export interface DatabaseError extends AppError {
  code: typeof ERROR_CODES.DATABASE_ERROR;
  details?: {
    operation?: string;
    collection?: string;
    query?: any;
  };
}

export interface CacheError extends AppError {
  code: typeof ERROR_CODES.CACHE_ERROR;
  details?: {
    key?: string;
    operation?: string;
  };
}

export interface ConfigError extends AppError {
  code: typeof ERROR_CODES.CONFIG_ERROR;
  details?: {
    key?: string;
    value?: any;
  };
} 