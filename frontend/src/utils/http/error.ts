import type { AxiosError } from 'axios';

// 错误类型枚举
export enum HttpErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  CANCEL = 'CANCEL',
  UNKNOWN = 'UNKNOWN',
}

// HTTP 错误接口
export interface HttpError extends Error {
  type: HttpErrorType;
  status?: number;
  code?: string | number;
  data?: unknown;
}

// 错误处理器接口
export interface ErrorHandler {
  handle(error: HttpError): Promise<void>;
}

// 默认错误处理器
export class DefaultErrorHandler implements ErrorHandler {
  async handle(error: HttpError): Promise<void> {
    switch (error.type) {
      case HttpErrorType.NETWORK:
        console.error('网络错误:', error.message);
        break;
      case HttpErrorType.TIMEOUT:
        console.error('请求超时:', error.message);
        break;
      case HttpErrorType.AUTH:
        console.error('认证错误:', error.message);
        break;
      case HttpErrorType.SERVER:
        console.error('服务器错误:', error.message);
        break;
      case HttpErrorType.CLIENT:
        console.error('客户端错误:', error.message);
        break;
      case HttpErrorType.CANCEL:
        console.warn('请求已取消:', error.message);
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}

// 错误工厂
export class HttpErrorFactory {
  static create(error: unknown): HttpError {
    if (this.isAxiosError(error)) {
      return this.createFromAxiosError(error);
    }
    return this.createUnknownError(error);
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  private static createFromAxiosError(error: AxiosError): HttpError {
    const httpError = new Error(error.message) as HttpError;

    if (error.response) {
      const status = error.response.status;
      httpError.status = status;
      httpError.data = error.response.data;

      if (status === 401 || status === 403) {
        httpError.type = HttpErrorType.AUTH;
      } else if (status >= 500) {
        httpError.type = HttpErrorType.SERVER;
      } else if (status >= 400) {
        httpError.type = HttpErrorType.CLIENT;
      } else {
        httpError.type = HttpErrorType.UNKNOWN;
      }
    } else if (error.code === 'ECONNABORTED') {
      httpError.type = HttpErrorType.TIMEOUT;
    } else if (error.message === 'Network Error') {
      httpError.type = HttpErrorType.NETWORK;
    } else if (error.message?.includes('canceled')) {
      httpError.type = HttpErrorType.CANCEL;
    } else {
      httpError.type = HttpErrorType.UNKNOWN;
    }

    return httpError;
  }

  private static createUnknownError(error: unknown): HttpError {
    const httpError = new Error(
      error instanceof Error ? error.message : 'Unknown error'
    ) as HttpError;
    httpError.type = HttpErrorType.UNKNOWN;
    return httpError;
  }
} 