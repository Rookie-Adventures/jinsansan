import { AxiosError } from 'axios';

export enum HttpErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  REACT_ERROR = 'REACT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  AUTH = 'AUTH_ERROR',
}

export class HttpError extends Error {
  code: string;
  status?: number;
  data?: any;
  isAxiosError?: boolean;
  type: HttpErrorType;

  constructor(params: {
    type: HttpErrorType;
    message: string;
    code?: string;
    status?: number;
    data?: any;
    isAxiosError?: boolean;
  }) {
    super(params.message);
    this.name = 'HttpError';
    this.type = params.type;
    this.code = params.code || params.type;
    this.status = params.status;
    this.data = params.data;
    this.isAxiosError = params.isAxiosError;
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  data?: any;
}

export type ErrorFactory = (error: AxiosError | Error) => HttpError;

export interface ErrorHandler {
  handle: (error: HttpError) => void;
}
