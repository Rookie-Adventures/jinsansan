import { HttpError } from './error';
import { HttpErrorType } from './types';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: HttpError) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: HttpError) => {
    // 默认只重试网络错误和超时错误
    return (
      error.recoverable &&
      [HttpErrorType.NETWORK, HttpErrorType.TIMEOUT].includes(error.type) &&
      error.retryCount < 3
    );
  },
};

export class ErrorRetryMiddleware {
  private options: Required<RetryOptions>;

  constructor(options?: RetryOptions) {
    this.options = { ...defaultRetryOptions, ...options };
  }

  async handle<T>(
    operation: () => Promise<T>,
    error: HttpError
  ): Promise<T> {
    if (!this.options.shouldRetry(error)) {
      throw error;
    }

    if (error.retryCount >= this.options.maxRetries) {
      error.recoverable = false;
      throw error;
    }

    // 增加重试计数
    error.retryCount++;

    // 等待指定时间后重试
    await new Promise(resolve => 
      setTimeout(resolve, this.options.retryDelay * error.retryCount)
    );

    // 执行重试操作
    try {
      return await operation();
    } catch (retryError) {
      if (retryError instanceof HttpError) {
        // 保持原始重试计数
        retryError.retryCount = error.retryCount;
        return this.handle(operation, retryError);
      }
      throw retryError;
    }
  }
} 