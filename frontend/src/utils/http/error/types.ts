export enum HttpErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  CANCEL = 'CANCEL',
  UNKNOWN = 'UNKNOWN',
  REACT_ERROR = 'REACT_ERROR'
}

export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
} 