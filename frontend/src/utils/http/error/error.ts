import { HttpErrorType, ErrorTrace } from './types';

export class HttpError extends Error {
  public type: HttpErrorType;
  public status?: number;
  public code?: string | number;
  public data?: unknown;
  public trace?: ErrorTrace;
  public recoverable: boolean;
  public retryCount: number;

  constructor(options: {
    type: HttpErrorType;
    message: string;
    status?: number;
    code?: string | number;
    data?: unknown;
    trace?: ErrorTrace;
    recoverable?: boolean;
    retryCount?: number;
  }) {
    super(options.message);
    this.name = 'HttpError';
    this.type = options.type;
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
    this.trace = options.trace;
    this.recoverable = options.recoverable ?? false;
    this.retryCount = options.retryCount ?? 0;

    // 确保 Error 的堆栈跟踪正确工作
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
} 