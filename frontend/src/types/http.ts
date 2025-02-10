export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
  withCredentials?: boolean;
}

export interface ResponseType<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
  post<T = unknown>(url: string, data?: Record<string, unknown>, config?: RequestConfig): Promise<ResponseType<T>>;
  put<T = unknown>(url: string, data?: Record<string, unknown>, config?: RequestConfig): Promise<ResponseType<T>>;
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<ResponseType<T>>;
}
