import type { AxiosRequestConfig } from 'axios';

export interface HttpRequestConfig extends AxiosRequestConfig {
  cache?: {
    enable: boolean;
    ttl: number;
    key?: string;
  };
  retry?: {
    times: number;
    delay: number;
  };
  queue?: {
    enable: boolean;
    priority: number;
  };
}

export interface RequestManager {
  cache: Map<string, unknown>;
  generateCacheKey: (config: Record<string, unknown>) => string;
  getCacheData: <T>(key: string) => T | null;
  setCacheData: <T>(key: string, data: T, ttl: number) => void;
}

// 创建请求管理器实例
class HttpRequestManagerImpl implements RequestManager {
  public cache: Map<string, unknown>;

  constructor() {
    this.cache = new Map();
  }

  generateCacheKey(config: Record<string, unknown>): string {
    return JSON.stringify(config);
  }

  getCacheData<T>(key: string): T | null {
    return (this.cache.get(key) as T) || null;
  }

  setCacheData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export const requestManager = new HttpRequestManagerImpl();

// 导出 HTTP 客户端
export const http = {
  get: async <T>(_url: string, _config?: Omit<HttpRequestConfig, 'url' | 'method'>) => {
    // 实际实现将在后续添加
    return {} as T;
  },
  post: async <T>(_url: string, _data?: unknown, _config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) => {
    // 实际实现将在后续添加
    return {} as T;
  },
  put: async <T>(_url: string, _data?: unknown, _config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) => {
    // 实际实现将在后续添加
    return {} as T;
  },
  delete: async <T>(_url: string, _config?: Omit<HttpRequestConfig, 'url' | 'method'>) => {
    // 实际实现将在后续添加
    return {} as T;
  },
}; 