import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios';

import type { ErrorHandler } from './error';
import type { ProgressInfo } from './progress-monitor';
import type { RetryConfig } from './retry';

// 扩展 Axios 请求配置
export interface HttpRequestConfig extends AxiosRequestConfig {
  // 缓存配置
  cache?: {
    enable: boolean;
    ttl: number;
    key?: string;
  };

  // 队列配置
  queue?: {
    enable: boolean;
    priority: number;
    concurrency?: number;
  };

  // 重试配置
  retry?: RetryConfig;

  // 错误处理配置
  errorHandler?: ErrorHandler;

  // 取消令牌ID
  cancelTokenId?: string;

  // 防抖配置
  debounce?: {
    enable: boolean;
    wait: number;
    options?: {
      leading?: boolean;
      trailing?: boolean;
    };
  };

  // 节流配置
  throttle?: {
    enable: boolean;
    wait: number;
    options?: {
      leading?: boolean;
      trailing?: boolean;
    };
  };

  // 进度配置
  progress?: {
    onUploadProgress?: (info: ProgressInfo) => void;
    onDownloadProgress?: (info: ProgressInfo) => void;
  };

  // 进度事件处理
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  onDownloadProgress?: (event: AxiosProgressEvent) => void;
}

// 缓存数据接口
export interface CacheData<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 队列项接口
export interface QueueItem {
  config: HttpRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  priority: number;
}

// 请求管理器接口
export interface RequestManager {
  cache: Map<string, CacheData>;
  cancelTokens: Map<string, AbortController>;
  queue: QueueItem[];
  generateCacheKey: (config: HttpRequestConfig) => string;
  getCacheData: <T>(key: string) => T | null;
  setCacheData: <T>(key: string, data: T, ttl: number) => void;
  cancelRequest: (token: string) => void;
  cancelAllRequests: () => void;
  addToQueue: (
    config: HttpRequestConfig,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void
  ) => void;
  processQueue: () => Promise<void>;
} 