export enum HttpErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  CANCEL = 'CANCEL',
  UNKNOWN = 'UNKNOWN',
  REACT_ERROR = 'REACT_ERROR',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export type ErrorSeverity = 'critical' | 'warning' | 'info' | 'error';

export interface ErrorTrace {
  id: string;
  timestamp: number;
  path: string;
  componentStack?: string;
  breadcrumbs: Array<{
    action: string;
    timestamp: number;
    data?: unknown;
  }>;
}

export interface ErrorMetadata {
  userId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
  trace?: ErrorTrace;
  recoverable?: boolean;
  retryCount?: number;
  severity?: ErrorSeverity;
  metadata?: ErrorMetadata;
  stack?: string;
  description?: string;
} 