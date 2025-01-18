import type { AxiosError, AxiosRequestConfig } from 'axios';

export interface HttpConfig extends AxiosRequestConfig {
  // 基础配置
  baseURL: string;
  timeout: number;
  
  // 缓存配置
  cache?: {
    enable: boolean;
    ttl: number; // milliseconds
    key?: string; // 添加可选的 key 属性
  };
  
  // 重试配置
  retry?: {
    times: number;
    delay: number; // milliseconds
    shouldRetry?: (error: AxiosError | Error) => boolean;
  };
  
  // 并发控制
  queue?: {
    enable: boolean;
    concurrency?: number; // 设为可选
    priority: number;
  };
  
  // 性能优化
  debounce?: {
    wait: number;
    options?: {
      leading?: boolean;
      trailing?: boolean;
    };
  };
  
  throttle?: {
    wait: number;
    options?: {
      leading?: boolean;
      trailing?: boolean;
    };
  };
}

export const defaultConfig: HttpConfig = {
  baseURL: '/api',
  timeout: 10000,
  
  cache: {
    enable: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    key: undefined,
  },
  
  retry: {
    times: 3,
    delay: 1000,
    shouldRetry: (error: AxiosError | Error) => {
      if ('response' in error && error.response?.status) {
        const status = error.response.status;
        return status >= 500 || status === 429;
      }
      return false;
    },
  },
  
  queue: {
    enable: true,
    concurrency: 3,
    priority: 0, // 默认优先级
  },
  
  debounce: {
    wait: 1000,
    options: { leading: true },
  },
  
  throttle: {
    wait: 1000,
    options: { trailing: true },
  },
}; 