// 统一导出错误处理模块
export * from './error/factory';
export * from './error/index';
export * from './error/logger';
export * from './error/prevention';
export * from './error/recovery';
export * from './error/types';

import { AxiosError, AxiosRequestConfig } from 'axios';
import { NotificationManager } from '../notification/manager';

export enum HttpErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorStats {
  [key: string]: number;
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
}

interface ErrorResponse {
  message?: string;
  code?: string | number;
  data?: unknown;
}

export class HttpErrorHandler {
  private static instance: HttpErrorHandler;
  private notificationManager: NotificationManager;
  private errorStats: ErrorStats;
  private readonly maxRetries: number = 3;
  private retryDelays: number[] = [1000, 2000, 4000]; // 重试延迟时间（毫秒）

  private constructor() {
    this.notificationManager = NotificationManager.getInstance();
    this.errorStats = {} as ErrorStats;
    Object.values(HttpErrorType).forEach(type => {
      this.errorStats[type] = 0;
    });
  }

  public static getInstance(): HttpErrorHandler {
    if (!HttpErrorHandler.instance) {
      HttpErrorHandler.instance = new HttpErrorHandler();
    }
    return HttpErrorHandler.instance;
  }

  public async handleError(error: AxiosError<ErrorResponse>, retryCount: number = 0): Promise<any> {
    const errorType = this.categorizeError(error);
    this.errorStats[errorType]++;

    // 记录错误
    console.error(`HTTP Error (${errorType}):`, error);

    // 检查是否可以重试
    if (this.canRetry(errorType, retryCount)) {
      return this.retryRequest(error, retryCount);
    }

    // 显示错误通知
    this.showErrorNotification(errorType, error);

    // 抛出错误以便上层处理
    throw this.transformError(error, errorType);
  }

  private categorizeError(error: AxiosError<ErrorResponse>): HttpErrorType {
    if (!error.response) {
      return error.code === 'ECONNABORTED' ? HttpErrorType.TIMEOUT : HttpErrorType.NETWORK;
    }

    const status = error.response.status;
    if (status >= 400 && status < 500) {
      return HttpErrorType.CLIENT;
    } else if (status >= 500) {
      return HttpErrorType.SERVER;
    }

    return HttpErrorType.UNKNOWN;
  }

  private canRetry(errorType: HttpErrorType, retryCount: number): boolean {
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // 只对网络错误、超时和服务器错误进行重试
    return [HttpErrorType.NETWORK, HttpErrorType.TIMEOUT, HttpErrorType.SERVER].includes(errorType);
  }

  private async retryRequest(error: AxiosError<ErrorResponse>, retryCount: number): Promise<any> {
    const delay = this.retryDelays[retryCount] || this.retryDelays[this.retryDelays.length - 1];
    
    // 显示重试通知
    this.notificationManager.showNotification({
      type: 'warning',
      message: `请求失败，${delay/1000}秒后重试(${retryCount + 1}/${this.maxRetries})`,
      duration: delay
    });

    // 等待指定时间
    await new Promise(resolve => setTimeout(resolve, delay));

    // 重新发起请求
    try {
      if (!error.config) {
        throw new Error('No config found for retry');
      }
      
      // 创建新的请求配置，避免修改原始配置
      const retryConfig = { ...error.config } as ExtendedAxiosRequestConfig;
      // 确保不会无限重试
      retryConfig.retry = false;
      
      const response = await fetch(retryConfig.url!, {
        method: retryConfig.method,
        headers: retryConfig.headers as Record<string, string>,
        body: retryConfig.data
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (retryError) {
      // 递归调用handleError，增加重试计数
      return this.handleError(retryError as AxiosError<ErrorResponse>, retryCount + 1);
    }
  }

  private showErrorNotification(errorType: HttpErrorType, error: AxiosError<ErrorResponse>): void {
    const errorMessages: { [key in HttpErrorType]: string } = {
      [HttpErrorType.NETWORK]: '网络连接失败，请检查网络设置',
      [HttpErrorType.SERVER]: '服务器错误，请稍后重试',
      [HttpErrorType.CLIENT]: '请求参数错误，请检查输入',
      [HttpErrorType.TIMEOUT]: '请求超时，请稍后重试',
      [HttpErrorType.UNKNOWN]: '未知错误，请联系管理员'
    };

    const message = errorMessages[errorType];
    const details = error.response?.data?.message || error.message;

    this.notificationManager.showNotification({
      type: 'error',
      message,
      description: details,
      duration: 5000
    });
  }

  private transformError(error: AxiosError<ErrorResponse>, errorType: HttpErrorType): Error {
    const transformedError = new Error(error.message);
    (transformedError as any).type = errorType;
    (transformedError as any).originalError = error;
    return transformedError;
  }

  public getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  public resetErrorStats(): void {
    Object.keys(this.errorStats).forEach(key => {
      this.errorStats[key] = 0;
    });
  }
}

export default HttpErrorHandler; 