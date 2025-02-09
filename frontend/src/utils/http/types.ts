import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NotificationSeverity } from '../notification/types';

export interface HttpRequestConfig extends AxiosRequestConfig {
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
  abstract get<T = any>(_url: string, _config?: HttpRequestConfig): Promise<T>;
  abstract post<T = any>(_url: string, _data?: any, _config?: HttpRequestConfig): Promise<T>;
  abstract put<T = any>(_url: string, _data?: any, _config?: HttpRequestConfig): Promise<T>;
  abstract delete<T = any>(_url: string, _config?: HttpRequestConfig): Promise<T>;
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface HttpError extends Error {
  status?: number;
  code?: string;
  severity?: NotificationSeverity;
  isAxiosError?: boolean;
  response?: AxiosResponse;
} 