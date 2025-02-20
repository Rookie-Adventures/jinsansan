import type { AxiosRequestConfig } from 'axios';

import { Logger } from '@/infrastructure/logging/Logger';

import { HttpError, HttpErrorType } from './types';


interface ExtendedHttpError extends HttpError {
  config?: AxiosRequestConfig & { retryCount?: number };
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 5000]; // 重试延迟时间（毫秒）
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  public async attemptRecovery(error: ExtendedHttpError): Promise<boolean> {
    try {
      // 根据错误类型尝试恢复
      switch (error.type) {
        case HttpErrorType.NETWORK_ERROR:
          return await this.handleNetworkError(error);
        case HttpErrorType.AUTH:
          return await this.handleAuthError(error);
        default:
          return false;
      }
    } catch (e) {
      this.logger.error('Recovery attempt failed', {
        error: e instanceof Error ? e : new Error('Unknown error'),
        originalError: error,
      });
      return false;
    }
  }

  private async handleNetworkError(error: ExtendedHttpError): Promise<boolean> {
    // 记录网络错误详情
    this.logger.warn(`Network recovery attempt: ${error.message}`, {
      status: error.status,
      code: error.code,
      url: error.config?.url,
    });

    // 处理特定的网络错误
    if (error.code === 'TIMEOUT') {
      // 超时错误处理
      return await this.handleTimeout(error);
    } else if (error.code === 'NETWORK_ERROR') {
      // 网络连接错误处理
      return await this.handleConnectionError(error);
    }

    return false;
  }

  private async handleAuthError(error: ExtendedHttpError): Promise<boolean> {
    // 记录认证错误详情
    this.logger.warn(`Auth recovery attempt: ${error.message}`, {
      status: error.status,
      code: error.code,
    });

    // 处理特定的认证错误
    if (error.code === 'TOKEN_EXPIRED') {
      // Token过期处理
      return await this.handleTokenExpiration(error);
    } else if (error.code === 'INVALID_TOKEN') {
      // Token无效处理
      return await this.handleInvalidToken(error);
    }

    return false;
  }

  private async handleTimeout(error: ExtendedHttpError): Promise<boolean> {
    const retryCount = (error.data as { retryCount?: number })?.retryCount || 0;
    // 如果已经达到最大重试次数，返回 false
    if (retryCount >= this.maxRetries) {
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, this.retryDelays[retryCount]));
    return true;
  }

  private async handleConnectionError(error: ExtendedHttpError): Promise<boolean> {
    // 网络连接错误恢复逻辑
    if (!navigator.onLine || (error.config?.retryCount || 0) >= this.maxRetries) {
      return false;
    }
    return true;
  }

  private async handleTokenExpiration(error: ExtendedHttpError): Promise<boolean> {
    // Token过期恢复逻辑
    try {
      // 记录Token过期信息
      this.logger.warn('Token expired, attempting refresh', {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      // 这里可以添加刷新token的逻辑
      return true;
    } catch (e) {
      this.logger.error('Token refresh failed', {
        error: e instanceof Error ? e : new Error('Unknown error'),
        originalError: error,
      });
      return false;
    }
  }

  private async handleInvalidToken(error: ExtendedHttpError): Promise<boolean> {
    // 无效Token处理逻辑
    this.logger.error('Invalid token detected', {
      message: error.message,
      code: error.code,
      status: error.status,
    });
    return false;
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance();
