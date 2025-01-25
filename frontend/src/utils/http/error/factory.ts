import type { AxiosError } from 'axios';
import { HttpError } from './error';
import { HttpErrorType } from './types';

interface ErrorResponse {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  code?: string;
}

interface ResponseLikeError {
  response: {
    status: number;
    data?: ErrorResponse;
  };
  message?: string;
}

export class HttpErrorFactory {
  static create(error: unknown): HttpError {
    if (!error) {
      return new HttpError({
        type: HttpErrorType.UNKNOWN,
        message: 'An unknown error occurred',
        recoverable: false,
        severity: 'warning'
      });
    }

    if (this.isAxiosError(error) || this.isResponseLikeError(error)) {
      return this.createFromAxiosError(error);
    }

    if (error instanceof Error) {
      return this.createFromError(error);
    }

    if (this.isCancelError(error)) {
      return new HttpError({
        type: HttpErrorType.CANCEL,
        message: (error as { message: string }).message || 'Request cancelled',
        recoverable: false,
        severity: 'info'
      });
    }

    return new HttpError({
      type: HttpErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      recoverable: false,
      severity: 'warning'
    });
  }

  private static isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
    return Boolean(error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError === true);
  }

  private static isResponseLikeError(error: unknown): error is ResponseLikeError {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response
    );
  }

  private static isCancelError(error: unknown): error is { __CANCEL__: boolean; message: string } {
    return Boolean(error && typeof error === 'object' && '__CANCEL__' in error);
  }

  private static createFromAxiosError(error: AxiosError<ErrorResponse> | ResponseLikeError): HttpError {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const message = responseData?.message || (error as { message?: string }).message || '未知错误';
    const code = responseData?.code;

    if (this.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return new HttpError({
          type: HttpErrorType.TIMEOUT,
          message: '请求超时，请稍后重试',
          recoverable: true,
          severity: 'warning',
          code
        });
      }

      if (error.message === 'Network Error') {
        return new HttpError({
          type: HttpErrorType.NETWORK,
          message: '网络连接失败，请检查网络设置',
          recoverable: true,
          severity: 'warning',
          code
        });
      }
    }

    switch (status) {
      case 400:
        return new HttpError({
          type: HttpErrorType.CLIENT,
          message,
          status,
          recoverable: false,
          severity: 'warning',
          code,
          data: responseData?.errors
        });
      case 401:
        return new HttpError({
          type: HttpErrorType.AUTH,
          message: message || '用户未登录或登录已过期',
          status,
          recoverable: true,
          severity: 'warning',
          code
        });
      case 403:
        return new HttpError({
          type: HttpErrorType.AUTH,
          message: message || '没有权限访问该资源',
          status,
          recoverable: false,
          severity: 'warning',
          code
        });
      case 404:
        return new HttpError({
          type: HttpErrorType.CLIENT,
          message: message || '请求的资源不存在',
          status,
          recoverable: false,
          severity: 'warning',
          code
        });
      case 422:
        return new HttpError({
          type: HttpErrorType.VALIDATION,
          message,
          status,
          data: responseData?.errors,
          recoverable: false,
          severity: 'warning',
          code
        });
      case 429:
        return new HttpError({
          type: HttpErrorType.CLIENT,
          message: message || '请求过于频繁，请稍后重试',
          status,
          recoverable: true,
          severity: 'warning',
          code
        });
      case 500:
      case 502:
      case 503:
      case 504:
        return new HttpError({
          type: HttpErrorType.SERVER,
          message: message || '服务器错误，请稍后重试',
          status,
          recoverable: true,
          severity: 'critical',
          code
        });
      default:
        return new HttpError({
          type: HttpErrorType.UNKNOWN,
          message,
          status,
          recoverable: false,
          severity: 'warning',
          code
        });
    }
  }

  private static createFromError(error: Error): HttpError {
    if (error.message.includes('Network Error')) {
      return new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network Error',
        recoverable: true,
        severity: 'warning'
      });
    }

    if (error.message.includes('timeout')) {
      return new HttpError({
        type: HttpErrorType.TIMEOUT,
        message: '请求超时，请稍后重试',
        recoverable: true,
        severity: 'warning'
      });
    }

    if (error instanceof TypeError) {
      return new HttpError({
        type: HttpErrorType.CLIENT,
        message: error.message,
        recoverable: false,
        severity: 'warning'
      });
    }

    return new HttpError({
      type: HttpErrorType.UNKNOWN,
      message: error.message,
      recoverable: false,
      severity: 'warning'
    });
  }
} 