import { ERROR_CODES, ERROR_MESSAGES, ERROR_SEVERITY } from '../constants/error';
export const createAppError = (code, message, severity = 'ERROR', details) => {
    return {
        code,
        message,
        severity: ERROR_SEVERITY[severity],
        details,
        timestamp: Date.now(),
    };
};
export const createValidationError = (field, value, message) => {
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
export const createAuthError = (code, details) => {
    return {
        code,
        message: ERROR_MESSAGES[code],
        severity: ERROR_SEVERITY.ERROR,
        details,
        timestamp: Date.now(),
    };
};
export const createNetworkError = (details) => {
    return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        severity: ERROR_SEVERITY.ERROR,
        details,
        timestamp: Date.now(),
    };
};
export const createDatabaseError = (details) => {
    return {
        code: ERROR_CODES.DATABASE_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR],
        severity: ERROR_SEVERITY.ERROR,
        details,
        timestamp: Date.now(),
    };
};
export const createCacheError = (details) => {
    return {
        code: ERROR_CODES.CACHE_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.CACHE_ERROR],
        severity: ERROR_SEVERITY.ERROR,
        details,
        timestamp: Date.now(),
    };
};
export const createConfigError = (details) => {
    return {
        code: ERROR_CODES.CONFIG_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.CONFIG_ERROR],
        severity: ERROR_SEVERITY.ERROR,
        details,
        timestamp: Date.now(),
    };
};
export const isAppError = (error) => {
    return (error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error &&
        'severity' in error &&
        'timestamp' in error);
};
export const isValidationError = (error) => {
    return (isAppError(error) &&
        error.code === ERROR_CODES.VALIDATION_ERROR &&
        error.details !== undefined &&
        'field' in error.details &&
        'value' in error.details &&
        'message' in error.details);
};
export const isAuthError = (error) => {
    return (isAppError(error) &&
        (error.code === ERROR_CODES.UNAUTHORIZED || error.code === ERROR_CODES.FORBIDDEN));
};
export const isNetworkError = (error) => {
    return isAppError(error) && error.code === ERROR_CODES.NETWORK_ERROR;
};
export const isDatabaseError = (error) => {
    return isAppError(error) && error.code === ERROR_CODES.DATABASE_ERROR;
};
export const isCacheError = (error) => {
    return isAppError(error) && error.code === ERROR_CODES.CACHE_ERROR;
};
export const isConfigError = (error) => {
    return isAppError(error) && error.code === ERROR_CODES.CONFIG_ERROR;
};
