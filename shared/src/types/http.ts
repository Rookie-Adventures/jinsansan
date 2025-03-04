import { API_HEADERS, API_CONTENT_TYPES } from '../constants/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HttpHeader = typeof API_HEADERS[keyof typeof API_HEADERS];
export type ContentType = typeof API_CONTENT_TYPES[keyof typeof API_CONTENT_TYPES];

export interface HttpHeaders {
  [key: string]: string;
}

export interface HttpParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface HttpConfig {
  method: HttpMethod;
  url: string;
  headers?: HttpHeaders;
  params?: HttpParams;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  validateStatus?: (status: number) => boolean;
  /** 取消请求的信号 */
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: HttpHeaders;
  config: HttpConfig;
}

export interface HttpError<T = any> {
  message: string;
  status: number;
  statusText: string;
  headers: HttpHeaders;
  config: HttpConfig;
  data?: T;
}

export interface HttpInterceptor {
  onRequest?: (config: HttpConfig) => HttpConfig | Promise<HttpConfig>;
  onResponse?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
  onError?: (error: HttpError) => HttpError | Promise<HttpError>;
}

export interface HttpInstance {
  request: <T = any>(config: HttpConfig) => Promise<HttpResponse<T>>;
  get: <T = any>(url: string, config?: Omit<HttpConfig, 'url' | 'method'>) => Promise<HttpResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: Omit<HttpConfig, 'url' | 'method' | 'data'>) => Promise<HttpResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: Omit<HttpConfig, 'url' | 'method' | 'data'>) => Promise<HttpResponse<T>>;
  patch: <T = any>(url: string, data?: any, config?: Omit<HttpConfig, 'url' | 'method' | 'data'>) => Promise<HttpResponse<T>>;
  delete: <T = any>(url: string, config?: Omit<HttpConfig, 'url' | 'method'>) => Promise<HttpResponse<T>>;
  interceptors: {
    request: {
      use: (interceptor: HttpInterceptor['onRequest']) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (interceptor: HttpInterceptor['onResponse']) => number;
      eject: (id: number) => void;
    };
    error: {
      use: (interceptor: HttpInterceptor['onError']) => number;
      eject: (id: number) => void;
    };
  };
} 