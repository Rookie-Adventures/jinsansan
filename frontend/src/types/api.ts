import type {
  ApiResponse,
  ApiError,
  ApiRequestConfig as SharedApiRequestConfig,
  ApiResponseConfig,
  ApiErrorResponse,
  ApiInterceptor,
  ApiInstance,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  FilterParams,
  QueryParams,
  CacheItem,
  CacheConfig,
  ProgressInfo,
  ProgressConfig
} from '@jinshanshan/shared/types/api';
import type { AxiosRequestConfig } from 'axios';

// 重新导出共享类型
export type {
  ApiResponse,
  ApiError,
  ApiResponseConfig,
  ApiErrorResponse,
  ApiInterceptor,
  ApiInstance,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  FilterParams,
  QueryParams,
  CacheItem,
  CacheConfig,
  ProgressInfo,
  ProgressConfig
};

/**
 * HTTP 请求配置
 * 扩展 Axios 请求配置，添加自定义配置项
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /** 用于取消请求的标识符 */
  cancelTokenId?: string;
  /** 进度监控配置 */
  progress?: ProgressConfig;
  /** 错误处理配置 */
  errorHandler?: {
    /** 错误处理函数 */
    handle: (error: ApiError) => Promise<void>;
  };
}

/**
 * 请求配置
 */
export interface RequestConfig extends SharedApiRequestConfig {
  /** 用于取消请求的标识符 */
  cancelTokenId?: string;
  /** 进度监控配置 */
  progress?: ProgressConfig;
  /** 错误处理配置 */
  errorHandler?: {
    /** 错误处理函数 */
    handle: (error: ApiError) => Promise<void>;
  };
} 