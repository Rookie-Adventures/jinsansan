import type { AxiosError } from 'axios';

export interface RetryConfig {
  enable?: boolean;
  times?: number;
  delay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultConfig: Required<RetryConfig> = {
  enable: true,
  times: 3,
  delay: 1000,
  shouldRetry: (error: unknown) => {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as AxiosError;
      // 如果是网络错误或超时错误，则重试
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

  while (attempts < (retryConfig.times ?? defaultConfig.times)) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      if (!retryConfig.shouldRetry(error)) {
        throw error;
      }

      attempts++;
      
      // 如果还有重试次数，则等待后重试
      if (attempts < (retryConfig.times ?? defaultConfig.times)) {
        await new Promise(resolve => 
          setTimeout(resolve, retryConfig.delay ?? defaultConfig.delay)
        );
      }
    }
  }

  throw lastError;
}

export const createRetry = (config?: RetryConfig) => {
  return <T>(fn: () => Promise<T>) => retry(fn, config);
}; 