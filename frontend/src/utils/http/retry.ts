import type { AxiosError } from 'axios';

import { errorLogger } from '@/utils/error/errorLogger';

export interface RetryConfig {
  enable?: boolean;
  times: number;
  delay: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const defaultConfig: RetryConfig = {
  enable: true,
  times: 3,
  delay: 1000,
  shouldRetry: (error: unknown) => {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as AxiosError;
      return !axiosError.response || axiosError.code === 'ECONNABORTED';
    }
    return true; // 默认重试所有非 Axios 错误
  },
};

const delay = (ms: number): Promise<void> => {
  let timeoutId: NodeJS.Timeout;

  return new Promise<void>((resolve, reject) => {
    try {
      timeoutId = setTimeout(() => {
        resolve();
      }, ms);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  }).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
};

export async function retry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T> {
  const retryConfig = { ...defaultConfig, ...config };

  if (!retryConfig.enable) {
    return fn();
  }

  let lastError: unknown;
  let attempt = 0;

  while (attempt < retryConfig.times) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const shouldRetry = !retryConfig.shouldRetry || retryConfig.shouldRetry(error);
      const isLastAttempt = attempt === retryConfig.times - 1;

      if (!shouldRetry || isLastAttempt) {
        throw error;
      }

      if (retryConfig.onRetry) {
        try {
          retryConfig.onRetry(error, attempt + 1);
        } catch (callbackError) {
          errorLogger.log(
            callbackError instanceof Error ? callbackError : new Error(String(callbackError)),
            {
              level: 'error',
              context: {
                source: 'RetryCallback',
                attempt: attempt + 1,
                timestamp: Date.now(),
              },
            }
          );
        }
      }

      const waitTime = retryConfig.delay * Math.pow(2, attempt);
      await delay(waitTime);
      attempt++;
    }
  }

  throw lastError;
}

export const createRetry = (
  config?: Partial<RetryConfig>
): (<T>(fn: () => Promise<T>) => Promise<T>) => {
  return <T>(fn: () => Promise<T>): Promise<T> => retry(fn, config);
};
