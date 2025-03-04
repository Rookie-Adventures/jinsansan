import { AppError, ValidationError, AuthError, NetworkError, DatabaseError, CacheError, ConfigError, ErrorCode } from '../types/error';
import { ERROR_CODES, ERROR_MESSAGES, ERROR_SEVERITY } from '../constants/error';

export const createAppError = (
  code: ErrorCode,
  message: string,
  severity: keyof typeof ERROR_SEVERITY = 'ERROR',
  details?: Record<string, any>
): AppError => {
  return {
    code,
    message,
    severity: ERROR_SEVERITY[severity],
    details,
    timestamp: Date.now(),
  };
};

export const createValidationError = (
  field: string,
  value: any,
  message: string
): ValidationError => {
  return {
    code: ERROR_CODES.VALIDATION_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
    severity: ERROR_SEVERITY.ERROR,
    details: {
      field,
      value,
      message,
    },
    timestamp: Date.now(),
  };
};

export const createAuthError = (
  code: typeof ERROR_CODES.UNAUTHORIZED | typeof ERROR_CODES.FORBIDDEN,
  details?: { token?: string; permissions?: string[] }
): AuthError => {
  return {
    code,
    message: ERROR_MESSAGES[code],
    severity: ERROR_SEVERITY.ERROR,
    details,
    timestamp: Date.now(),
  };
};

export const createNetworkError = (
  details?: { url?: string; method?: string; status?: number }
): NetworkError => {
  return {
    code: ERROR_CODES.NETWORK_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
    severity: ERROR_SEVERITY.ERROR,
    details,
    timestamp: Date.now(),
  };
};

export const createDatabaseError = (
  details?: { operation?: string; collection?: string; query?: any }
): DatabaseError => {
  return {
    code: ERROR_CODES.DATABASE_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR],
    severity: ERROR_SEVERITY.ERROR,
    details,
    timestamp: Date.now(),
  };
};

export const createCacheError = (
  details?: { key?: string; operation?: string }
): CacheError => {
  return {
    code: ERROR_CODES.CACHE_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.CACHE_ERROR],
    severity: ERROR_SEVERITY.ERROR,
    details,
    timestamp: Date.now(),
  };
};

export const createConfigError = (
  details?: { key?: string; value?: any }
): ConfigError => {
  return {
    code: ERROR_CODES.CONFIG_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.CONFIG_ERROR],
    severity: ERROR_SEVERITY.ERROR,
    details,
    timestamp: Date.now(),
  };
};

export const isAppError = (error: any): error is AppError => {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'severity' in error &&
    'timestamp' in error
  );
};

export const isValidationError = (error: any): error is ValidationError => {
  return (
    isAppError(error) &&
    error.code === ERROR_CODES.VALIDATION_ERROR &&
    error.details !== undefined &&
    'field' in error.details &&
    'value' in error.details &&
    'message' in error.details
  );
};

export const isAuthError = (error: any): error is AuthError => {
  return (
    isAppError(error) &&
    (error.code === ERROR_CODES.UNAUTHORIZED || error.code === ERROR_CODES.FORBIDDEN)
  );
};

export const isNetworkError = (error: any): error is NetworkError => {
  return isAppError(error) && error.code === ERROR_CODES.NETWORK_ERROR;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return isAppError(error) && error.code === ERROR_CODES.DATABASE_ERROR;
};

export const isCacheError = (error: any): error is CacheError => {
  return isAppError(error) && error.code === ERROR_CODES.CACHE_ERROR;
};

export const isConfigError = (error: any): error is ConfigError => {
  return isAppError(error) && error.code === ERROR_CODES.CONFIG_ERROR;
}; 