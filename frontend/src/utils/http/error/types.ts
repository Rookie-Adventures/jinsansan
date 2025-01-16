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
  BUSINESS = 'BUSINESS'
}

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

export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
  trace?: ErrorTrace;
  recoverable?: boolean;
  retryCount?: number;
} 