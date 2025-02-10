import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NotificationSeverity } from '../notification/types';
import type { RequestConfig, ResponseType } from '../../types/http';

export interface HttpRequestConfig extends RequestConfig {
  retry?: boolean;
  retryTimes?: number;
  retryDelay?: number;
  withProgress?: boolean;
  cache?: {
    enable?: boolean;
    key?: string;
    ttl?: number;
  };
  queue?: {
    enable: boolean;
    priority: number;
  };
}

export abstract class RequestMethod {
  abstract get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>>;
  abstract post<T = unknown>(url: string, data?: Record<string, unknown>, config?: HttpRequestConfig): Promise<ResponseType<T>>;
  abstract put<T = unknown>(url: string, data?: Record<string, unknown>, config?: HttpRequestConfig): Promise<ResponseType<T>>;
  abstract delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>>;
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface HttpError extends Error {
  status?: number;
  code?: string;
  severity?: NotificationSeverity;
  isAxiosError?: boolean;
  response?: AxiosResponse;
}
