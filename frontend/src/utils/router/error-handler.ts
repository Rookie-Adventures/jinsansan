import { errorLogger } from '@/utils/error/errorLogger';
import { ErrorLogger } from '@/utils/http/error/logger';
import type { HttpError } from '@/utils/http/error/types';
import { HttpErrorType } from '@/utils/http/error/types';

interface RouterError extends Error {
  status?: number;
  data?: unknown;
}

class RouterErrorHandler {
  private static instance: RouterErrorHandler;
  private logger: ErrorLogger;

  private constructor() {
    this.logger = ErrorLogger.getInstance();
  }

  static getInstance(): RouterErrorHandler {
    if (!RouterErrorHandler.instance) {
      RouterErrorHandler.instance = new RouterErrorHandler();
    }
    return RouterErrorHandler.instance;
  }

  handleError(error: unknown, info?: { path?: string }): void {
    const routerError = this.normalizeError(error);
    
    // 记录错误
    this.logger.log({
      type: HttpErrorType.REACT_ERROR,
      message: routerError.message,
      stack: routerError.stack,
      data: {
        ...info,
        status: routerError.status,
        errorData: routerError.data
      }
    } as HttpError);

    // 根据错误类型处理
    if (routerError.status === 404) {
      this.handle404Error(routerError);
    } else if (routerError.status === 403) {
      this.handle403Error(routerError);
    } else {
      this.handleUnknownError(routerError);
    }
  }

  private normalizeError(error: unknown): RouterError {
    if (error instanceof Error) {
      return error as RouterError;
    }
    return new Error(String(error)) as RouterError;
  }

  private handle404Error(error: RouterError): void {
    errorLogger.log(new Error('Route not found: ' + error.message), {
      level: 'error',
      context: {
        status: error.status,
        errorData: error.data
      }
    });
    // 可以在这里添加重定向到 404 页面的逻辑
  }

  private handle403Error(error: RouterError): void {
    errorLogger.log(new Error('Access forbidden: ' + error.message), {
      level: 'error',
      context: {
        status: error.status,
        errorData: error.data
      }
    });
    // 可以在这里添加重定向到 403 页面的逻辑
  }

  private handleUnknownError(error: RouterError): void {
    errorLogger.log(new Error('Unknown router error: ' + error.message), {
      level: 'error',
      context: {
        status: error.status,
        errorData: error.data
      }
    });
    // 可以在这里添加重定向到通用错误页面的逻辑
  }

  private handleWarning(warning: string): void {
    errorLogger.log(new Error(warning), {
      level: 'warn'
    });
  }

  private handleCritical(error: Error): void {
    errorLogger.log(error, {
      level: 'critical',
      context: {
        timestamp: Date.now(),
        isCritical: true
      }
    });
  }
}

export const routerErrorHandler = RouterErrorHandler.getInstance(); 