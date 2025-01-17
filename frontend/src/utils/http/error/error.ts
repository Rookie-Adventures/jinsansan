import { HttpErrorType, ErrorTrace, ErrorSeverity, ErrorMetadata } from './types';

export class HttpError extends Error {
  public type: HttpErrorType;
  public status?: number;
  public code?: string | number;
  public data?: unknown;
  public trace?: ErrorTrace;
  public recoverable: boolean;
  public retryCount: number;
  public severity: ErrorSeverity;
  public metadata?: ErrorMetadata;

  constructor(options: {
    type: HttpErrorType;
    message: string;
    status?: number;
    code?: string | number;
    data?: unknown;
    trace?: ErrorTrace;
    recoverable?: boolean;
    retryCount?: number;
    severity?: ErrorSeverity;
    metadata?: ErrorMetadata;
    stack?: string;
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
    this.severity = options.severity ?? 'info';
    this.metadata = options.metadata;

    // 如果提供了自定义堆栈，则使用它
    if (options.stack) {
      this.stack = options.stack;
    }
    // 否则确保 Error 的堆栈跟踪正确工作
    else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
} 