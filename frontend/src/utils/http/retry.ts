import type { AxiosError } from 'axios';

export interface RetryConfig {
  enable?: boolean;
  times: number;
  delay: number;
  shouldRetry?: (error: unknown) => boolean;
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
  config?: RetryConfig
): Promise<T> {
  const retryConfig = { ...defaultConfig, ...config };
  let lastError: unknown;
  let attempts = 0;

  while (attempts < retryConfig.times) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      if (retryConfig.shouldRetry && !retryConfig.shouldRetry(error)) {
        throw error;
      }

      attempts++;
      
      // 如果还有重试次数，则等待后重试
      if (attempts < retryConfig.times) {
        await new Promise(resolve => 
          setTimeout(resolve, retryConfig.delay)
        );
      }
    }
  }

  throw lastError;
}

export const createRetry = (config?: RetryConfig) => {
  return <T>(fn: () => Promise<T>) => retry(fn, config);
}; 