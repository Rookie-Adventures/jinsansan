import type { AxiosError } from 'axios';

import { ErrorLogger } from './logger';
import { HttpErrorType } from './types';
import type { HttpError } from './types';

// 错误处理器接口
export interface ErrorHandler {
  handle(error: HttpError): Promise<void>;
}

// 默认错误处理器
export class DefaultErrorHandler implements ErrorHandler {
  private logger: ErrorLogger;
  private static instance: DefaultErrorHandler;

  private constructor() {
    this.logger = ErrorLogger.getInstance();
  }

  static getInstance(): DefaultErrorHandler {
    if (!DefaultErrorHandler.instance) {
      DefaultErrorHandler.instance = new DefaultErrorHandler();
    }
    return DefaultErrorHandler.instance;
  }

  async handle(error: HttpError): Promise<void> {
    // 记录错误
    this.logger.log(error);

    // 根据错误类型处理
    switch (error.type) {
      case HttpErrorType.AUTH:
        // 处理认证错误
        if (error.status === 401) {
          // 清除认证信息
          localStorage.removeItem('token');
          // 重定向到登录页
          window.location.href = '/login';
        }
        break;

      case HttpErrorType.NETWORK:
        // 网络错误可以触发重连逻辑
        this.handleNetworkError();
        break;

      case HttpErrorType.TIMEOUT:
        // 超时错误可以提示用户重试
        this.handleTimeoutError();
        break;

      case HttpErrorType.SERVER:
        // 服务器错误可以显示技术支持信息
        this.handleServerError(error);
        break;

      case HttpErrorType.CANCEL:
        // 取消的请求通常不需要特殊处理
        break;

      default:
        // 其他错误显示通用错误信息
        this.handleUnknownError(error);
    }
  }

  private handleNetworkError(): void {
    // 实现网络错误处理逻辑
    // 例如：显示网络重连对话框
  }

  private handleTimeoutError(): void {
    // 实现超时错误处理逻辑
    // 例如：显示重试按钮
  }

  private handleServerError(_error: HttpError): void {
    // 实现服务器错误处理逻辑
    // 例如：显示技术支持信息
  }

  private handleUnknownError(_error: HttpError): void {
    // 实现未知错误处理逻辑
    // 例如：显示通用错误信息
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

// 导出单例实例
export const defaultErrorHandler = DefaultErrorHandler.getInstance(); 