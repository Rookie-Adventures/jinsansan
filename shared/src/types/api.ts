import { ERROR_CODES } from '../constants/error';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ApiError {
  code: number;
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