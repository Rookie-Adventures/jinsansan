import type { HttpConfig, HttpHeaders, HttpParams, HttpMethod } from '@shared/types/http';
import { API_METHODS } from '@shared/constants/api';
import {
  createHttpConfig,
  createHeaders,
  createUrl,
  handleHttpError,
  isHttpError,
  getHttpErrorMessage,
  getHttpErrorStatus,
  getHttpErrorHeaders,
} from '@shared/utils/http';
import type { HttpError } from '@/utils/http/error/types';

export type { HttpConfig, HttpHeaders, HttpParams, HttpMethod };
export type { HttpError } from '@/utils/http/error/types';

// 缓存相关类型
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface Cache {
  storage: Map<string, CacheItem<unknown>>;
  get: <T>(key: string) => CacheItem<T> | null;
  set: <T>(key: string, item: CacheItem<T>) => void;
  delete: (key: string) => void;
  clear: () => void;
}

// 缓存实现
const cache: Cache = {
  storage: new Map<string, CacheItem<unknown>>(),
  
  get<T>(key: string): CacheItem<T> | null {
    const item = this.storage.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }
    
    return item as CacheItem<T>;
  },
  
  set<T>(key: string, item: CacheItem<T>): void {
    this.storage.set(key, item);
  },
  
  delete(key: string): void {
    this.storage.delete(key);
  },
  
  clear(): void {
    this.storage.clear();
  },
};

export const http = {
  get: async <T>(url: string, config?: Partial<HttpConfig>): Promise<T> => {
    const httpConfig = createHttpConfig(API_METHODS.GET, url, config);
    try {
      const response = await fetch(createUrl(httpConfig.url, '', httpConfig.params), {
        method: httpConfig.method,
        headers: createHeaders(httpConfig.headers),
        credentials: httpConfig.withCredentials ? 'include' : 'same-origin',
      });
      
      if (!response.ok) {
        throw handleHttpError({ response, config: httpConfig });
      }
      
      return response.json();
    } catch (error) {
      throw handleHttpError(error);
    }
  },

  post: async <T>(url: string, data?: any, config?: Partial<HttpConfig>): Promise<T> => {
    const httpConfig = createHttpConfig(API_METHODS.POST, url, { ...config, data });
    try {
      const response = await fetch(httpConfig.url, {
        method: httpConfig.method,
        headers: createHeaders(httpConfig.headers),
        body: JSON.stringify(httpConfig.data),
        credentials: httpConfig.withCredentials ? 'include' : 'same-origin',
      });
      
      if (!response.ok) {
        throw handleHttpError({ response, config: httpConfig });
      }
      
      return response.json();
    } catch (error) {
      throw handleHttpError(error);
    }
  },

  put: async <T>(url: string, data?: any, config?: Partial<HttpConfig>): Promise<T> => {
    const httpConfig = createHttpConfig(API_METHODS.PUT, url, { ...config, data });
    try {
      const response = await fetch(httpConfig.url, {
        method: httpConfig.method,
        headers: createHeaders(httpConfig.headers),
        body: JSON.stringify(httpConfig.data),
        credentials: httpConfig.withCredentials ? 'include' : 'same-origin',
      });
      
      if (!response.ok) {
        throw handleHttpError({ response, config: httpConfig });
      }
      
      return response.json();
    } catch (error) {
      throw handleHttpError(error);
    }
  },

  delete: async <T>(url: string, config?: Partial<HttpConfig>): Promise<T> => {
    const httpConfig = createHttpConfig(API_METHODS.DELETE, url, config);
    try {
      const response = await fetch(httpConfig.url, {
        method: httpConfig.method,
        headers: createHeaders(httpConfig.headers),
        credentials: httpConfig.withCredentials ? 'include' : 'same-origin',
      });
      
      if (!response.ok) {
        throw handleHttpError({ response, config: httpConfig });
      }
      
      return response.json();
    } catch (error) {
      throw handleHttpError(error);
    }
  },
};

export const requestManager = {
  isHttpError: (error: unknown): error is HttpError => isHttpError(error),
  getErrorMessage: (error: HttpError): string => getHttpErrorMessage(error),
  getErrorStatus: (error: HttpError): number => getHttpErrorStatus(error),
  getErrorHeaders: (error: HttpError): HttpHeaders => getHttpErrorHeaders(error),
  
  // 缓存相关方法
  getCacheData: <T>(key: string): T | null => {
    const item = cache.get<T>(key);
    return item?.data ?? null;
  },
  
  setCacheData: <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },
  
  generateCacheKey: (config: Record<string, unknown>): string => {
    return JSON.stringify(config);
  },
  
  cache,
}; 