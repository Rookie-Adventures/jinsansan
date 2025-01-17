import type { AxiosError } from 'axios';
import { HttpError } from './error';
import { HttpErrorType } from './types';

interface ErrorResponse {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
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
        recoverable: false
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
        recoverable: false
      });
    }

    return new HttpError({
      type: HttpErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      recoverable: false
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
    const message = responseData?.message || (error as { message?: string }).message || 'Unknown error';

    if (this.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return new HttpError({
          type: HttpErrorType.TIMEOUT,
          message: '请求超时，请稍后重试',
          recoverable: true
        });
      }

      if (error.message === 'Network Error') {
        return new HttpError({
          type: HttpErrorType.NETWORK,
          message: error.message,
          recoverable: true
        });
      }
    }

    switch (status) {
      case 401:
        return new HttpError({
          type: HttpErrorType.AUTH,
          message,
          status,
          recoverable: true
        });
      case 422:
        return new HttpError({
          type: HttpErrorType.VALIDATION,
          message,
          status,
          data: responseData?.errors,
          recoverable: false
        });
      case 500:
        return new HttpError({
          type: HttpErrorType.SERVER,
          message,
          status,
          recoverable: true
        });
      default:
        return new HttpError({
          type: HttpErrorType.UNKNOWN,
          message,
          status,
          recoverable: false
        });
    }
  }

  private static createFromError(error: Error): HttpError {
    if (error.message.includes('Network Error')) {
      return new HttpError({
        type: HttpErrorType.NETWORK,
        message: error.message,
        recoverable: true
      });
    }

    if (error.message.includes('timeout')) {
      return new HttpError({
        type: HttpErrorType.TIMEOUT,
        message: '请求超时，请稍后重试',
        recoverable: true
      });
    }

    return new HttpError({
      type: HttpErrorType.UNKNOWN,
      message: error.message,
      recoverable: false
    });
  }
} 