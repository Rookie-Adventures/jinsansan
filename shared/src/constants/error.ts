export const ERROR_CODES = {
  // 系统错误 (1-99)
  SYSTEM_ERROR: 1,
  CONFIG_ERROR: 2,
  DATABASE_ERROR: 3,
  CACHE_ERROR: 4,
  NETWORK_ERROR: 5,
  
  // 认证错误 (100-199)
  UNAUTHORIZED: 100,
  FORBIDDEN: 101,
  TOKEN_EXPIRED: 102,
  TOKEN_INVALID: 103,
  TOKEN_REQUIRED: 104,
  INVALID_CREDENTIALS: 105,
  
  // 验证错误 (200-299)
  VALIDATION_ERROR: 200,
  INVALID_INPUT: 201,
  MISSING_REQUIRED_FIELD: 202,
  INVALID_FORMAT: 203,
  VALUE_TOO_LONG: 204,
  VALUE_TOO_SHORT: 205,
  
  // 业务错误 (300-399)
  RESOURCE_NOT_FOUND: 300,
  RESOURCE_EXISTS: 301,
  RESOURCE_LOCKED: 302,
  RESOURCE_EXPIRED: 303,
  OPERATION_FAILED: 304,
  
  // 限流错误 (400-499)
  RATE_LIMIT_EXCEEDED: 400,
  TOO_MANY_REQUESTS: 401,
  SERVICE_UNAVAILABLE: 402,
  
  // 客户端错误 (500-599)
  BAD_REQUEST: 500,
  NOT_FOUND: 501,
  METHOD_NOT_ALLOWED: 502,
  CONFLICT: 503,
  UNSUPPORTED_MEDIA_TYPE: 504,
} as const;

export const ERROR_MESSAGES = {
  // 系统错误
  [ERROR_CODES.SYSTEM_ERROR]: 'System error occurred',
  [ERROR_CODES.CONFIG_ERROR]: 'Configuration error',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred',
  [ERROR_CODES.CACHE_ERROR]: 'Cache error occurred',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred',
  
  // 认证错误
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access',
  [ERROR_CODES.FORBIDDEN]: 'Access forbidden',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Token has expired',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid token',
  [ERROR_CODES.TOKEN_REQUIRED]: 'Token is required',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials',
  
  // 验证错误
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation error',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.VALUE_TOO_LONG]: 'Value is too long',
  [ERROR_CODES.VALUE_TOO_SHORT]: 'Value is too short',
  
  // 业务错误
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.RESOURCE_EXISTS]: 'Resource already exists',
  [ERROR_CODES.RESOURCE_LOCKED]: 'Resource is locked',
  [ERROR_CODES.RESOURCE_EXPIRED]: 'Resource has expired',
  [ERROR_CODES.OPERATION_FAILED]: 'Operation failed',
  
  // 限流错误
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service unavailable',
  
  // 客户端错误
  [ERROR_CODES.BAD_REQUEST]: 'Bad request',
  [ERROR_CODES.NOT_FOUND]: 'Not found',
  [ERROR_CODES.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ERROR_CODES.CONFLICT]: 'Conflict',
  [ERROR_CODES.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported media type',
} as const;

export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const; 