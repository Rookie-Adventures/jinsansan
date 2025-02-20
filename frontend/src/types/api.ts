import type { HttpError } from '@/utils/http/error/types';
import type { ProgressInfo } from '@/utils/http/progress-monitor';
import type { AxiosRequestConfig } from 'axios';

/**
 * API 响应的基础接口
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T = unknown> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * API 错误接口
 */
export interface ApiError {
  /** 错误码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: Record<string, unknown>;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分页响应数据
 * @template T - 列表项的类型
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  items: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  /** 排序字段 */
  field: string;
  /** 排序方向 */
  order: 'asc' | 'desc';
}

/**
 * 过滤参数
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null;
}

/**
 * HTTP 请求配置
 * 扩展 Axios 请求配置，添加自定义配置项
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /** 用于取消请求的标识符 */
  cancelTokenId?: string;
  /** 进度监控配置 */
  progress?: {
    /** 上传进度回调 */
    onUploadProgress?: (info: ProgressInfo) => void;
    /** 下载进度回调 */
    onDownloadProgress?: (info: ProgressInfo) => void;
  };
  /** 错误处理配置 */
  errorHandler?: {
    /** 错误处理函数 */
    handle: (error: HttpError) => Promise<void>;
  };
}

/**
 * 缓存项接口
 * @template T - 缓存数据的类型
 */
export interface CacheItem<T = unknown> {
  /** 缓存的数据 */
  data: T;
  /** 缓存时间戳 */
  timestamp: number;
  /** 缓存有效期（毫秒） */
  ttl: number;
}
