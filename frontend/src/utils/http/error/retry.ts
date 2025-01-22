import { errorConfig } from './config';
import { HttpError } from './error';
import { HttpErrorType } from './types';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: HttpError) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: errorConfig.retry.maxRetries,
  retryDelay: errorConfig.retry.retryDelay,
  maxDelay: errorConfig.retry.maxDelay,
  shouldRetry: (error: HttpError) => {
    return (
      error.recoverable &&
      errorConfig.retry.retryableErrors.includes(error.type) &&
      error.retryCount < errorConfig.retry.maxRetries
    );
  },
};

export class ErrorRetryMiddleware {
  private readonly options: Required<RetryOptions>;

  constructor(options?: RetryOptions) {
    this.options = { ...defaultRetryOptions, ...options };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handle<T>(
    operation: () => Promise<T>,
    error: HttpError
  ): Promise<T> {
    // 如果错误不可恢复，直接抛出
    if (!error.recoverable || !this.options.shouldRetry(error)) {
      error.recoverable = false;
      throw error;
    }

    // 执行重试操作
    let lastError = error;
    let attempts = 0;

    while (attempts < this.options.maxRetries) {
      try {
        attempts++;
        
        // 使用指数退避策略，但不超过最大延迟时间
        const delayTime = Math.min(
          this.options.retryDelay * Math.pow(2, attempts - 1),
          this.options.maxDelay
        );
        await this.delay(delayTime);

        // 执行操作
        return await operation();
      } catch (e) {
        if (e instanceof HttpError) {
          lastError = e;
          lastError.retryCount = attempts;

          // 如果新错误不可重试，终止重试
          if (!this.options.shouldRetry(lastError)) {
            lastError.recoverable = false;
            throw lastError;
          }
        } else {
          // 非 HttpError，包装后抛出
          throw new HttpError({
            type: HttpErrorType.UNKNOWN,
            message: e instanceof Error ? e.message : 'Unknown error',
            recoverable: false
          });
        }
      }
    }

    // 达到最大重试次数
    lastError.recoverable = false;
    throw lastError;
  }
} 