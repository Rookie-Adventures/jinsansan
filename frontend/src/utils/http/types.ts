import type { AxiosRequestConfig } from 'axios';
import type { ProgressInfo } from './progress-monitor';
import type { HttpConfig } from './config';

export interface HttpRequestConfig extends AxiosRequestConfig, Partial<HttpConfig> {
  // 请求标识，用于取消请求
  cancelTokenId?: string;
  
  // 进度监控
  progress?: {
    onUploadProgress?: (info: ProgressInfo) => void;
    onDownloadProgress?: (info: ProgressInfo) => void;
  };
  
  // 错误处理
  errorHandler?: {
    handle: (error: any) => Promise<void>;
  };
}

// 请求队列项
export interface QueueItem {
  id: string;
  priority: number;
  timestamp: number;
  config: HttpRequestConfig;
}

// 缓存项
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// HTTP 错误
export interface HttpError extends Error {
  code: number;
  status?: number;
  data?: any;
  config?: HttpRequestConfig;
  isHttpError: true;
}

// API 响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
} 