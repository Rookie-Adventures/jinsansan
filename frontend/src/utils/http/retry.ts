import type { AxiosError } from 'axios';

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
    return false;
  },
};

export async function retry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const retryConfig = { ...defaultConfig, ...config };
  let lastError: unknown;
  let attempts = 0;

  while (attempts < retryConfig.times) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempts++;
      
      // 检查是否应该重试
      if (!retryConfig.enable || (retryConfig.shouldRetry && !retryConfig.shouldRetry(error))) {
        throw error;
      }

      // 如果已达到最大重试次数，抛出最后一个错误
      if (attempts >= retryConfig.times) {
        throw lastError;
      }

      // 通知重试回调
      if (retryConfig.onRetry) {
        retryConfig.onRetry(error, attempts);
      }

      // 等待后重试
      await new Promise(resolve => 
        setTimeout(resolve, retryConfig.delay * Math.pow(2, attempts - 1))
      );
    }
  }

  throw lastError;
}

export const createRetry = (config?: Partial<RetryConfig>) => {
  return <T>(fn: () => Promise<T>) => retry(fn, config);
}; 