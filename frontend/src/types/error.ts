export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  path?: string;
  status?: number;
  errorData?: unknown;
  isCritical?: boolean;
  timestamp?: number;
}

export interface ErrorLogData {
  level: ErrorLevel;
  context: ErrorContext;
}
