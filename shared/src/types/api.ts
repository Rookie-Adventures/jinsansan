import { ERROR_CODES } from '../constants/error';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ApiError {
  code: keyof typeof ERROR_CODES;
  message: string;
  details?: Record<string, any>;
}

export interface ApiRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
}

export interface ApiResponseConfig {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  config: ApiRequestConfig;
}

export interface ApiErrorResponse extends ApiError {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
}

export interface ApiInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onResponse?: (response: ApiResponseConfig) => ApiResponseConfig | Promise<ApiResponseConfig>;
  onError?: (error: ApiErrorResponse) => ApiErrorResponse | Promise<ApiErrorResponse>;
}

export interface ApiInstance {
  request: <T = any>(config: ApiRequestConfig) => Promise<ApiResponse<T>>;
  get: <T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>) => Promise<ApiResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>) => Promise<ApiResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>) => Promise<ApiResponse<T>>;
  patch: <T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>) => Promise<ApiResponse<T>>;
  delete: <T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>) => Promise<ApiResponse<T>>;
  interceptors: {
    request: {
      use: (interceptor: ApiInterceptor['onRequest']) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (interceptor: ApiInterceptor['onResponse']) => number;
      eject: (id: number) => void;
    };
    error: {
      use: (interceptor: ApiInterceptor['onError']) => number;
      eject: (id: number) => void;
    };
  };
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
 * 排序参数
 */
export interface SortParams {
  /** 排序字段 */
  field: string;
  /** 排序方向 */
  order: 'asc' | 'desc';
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
 * 过滤参数
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null;
}

/**
 * 查询参数
 */
export interface QueryParams extends PaginationParams {
  /** 排序参数 */
  sort?: SortParams;
  /** 过滤参数 */
  filter?: FilterParams;
  /** 搜索关键词 */
  search?: string;
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

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean;
  /** 默认缓存时间（毫秒） */
  defaultTTL: number;
  /** 缓存键前缀 */
  prefix?: string;
}

/**
 * 进度信息
 */
export interface ProgressInfo {
  /** 已传输的字节数 */
  loaded: number;
  /** 总字节数 */
  total: number;
  /** 传输进度（0-100） */
  progress: number;
  /** 传输速度（字节/秒） */
  speed: number;
  /** 预计剩余时间（秒） */
  remainingTime: number;
}

/**
 * 进度监控配置
 */
export interface ProgressConfig {
  /** 上传进度回调 */
  onUploadProgress?: (info: ProgressInfo) => void;
  /** 下载进度回调 */
  onDownloadProgress?: (info: ProgressInfo) => void;
} 