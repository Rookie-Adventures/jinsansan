import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { flow } from 'lodash/fp';

import { withCache, withDebounce, withQueue, withThrottle } from './decorators';
import { DefaultErrorHandler, HttpErrorFactory } from './error';
import { createProgressMonitor } from './progress-monitor';
import { requestManager } from './request-manager';
import { retry } from './retry';
import type { HttpRequestConfig } from './types';

import { store } from '@/store';
import type { ApiResponse } from '@/types/api';

// 创建基础 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 默认错误处理器
const defaultErrorHandler = new DefaultErrorHandler();

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig & HttpRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 处理请求取消
    if (config.cancelTokenId) {
      const source = requestManager.createCancelToken(config.cancelTokenId);
      config.cancelToken = source.token;
    }

    return config;
  },
  (error) => Promise.reject(HttpErrorFactory.create(error))
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 200) {
      return Promise.reject(HttpErrorFactory.create(data));
    }
    return data.data;
  },
  (error) => Promise.reject(HttpErrorFactory.create(error))
);

// 基础请求函数
async function request<T = unknown>(config: HttpRequestConfig): Promise<T> {
  try {
    // 处理进度监控
    if (config.progress) {
      const uploadMonitor = createProgressMonitor();
      const downloadMonitor = createProgressMonitor();

      const axiosConfig: AxiosRequestConfig = {
        ...config,
        onUploadProgress: (event) => {
          config.progress?.onUploadProgress?.(uploadMonitor.onProgress(event));
        },
        onDownloadProgress: (event) => {
          config.progress?.onDownloadProgress?.(downloadMonitor.onProgress(event));
        },
      };

      config = axiosConfig;
    }

    // 包装请求函数
    const makeRequest = () => axiosInstance.request<ApiResponse<T>>(config);

    // 如果启用了重试，使用重试包装器
    const response = config.retry?.enable
      ? await retry(makeRequest, config.retry)
      : await makeRequest();

    // 如果请求有ID，从队列中移除
    if (config.cancelTokenId) {
      requestManager.removeFromQueue(config.cancelTokenId);
    }

    return response as T;
  } catch (error) {
    // 转换错误
    const httpError = HttpErrorFactory.create(error);

    // 使用自定义错误处理器或默认错误处理器
    const handler = config.errorHandler || defaultErrorHandler;
    await handler.handle(httpError);

    throw httpError;
  }
}

// 创建增强的请求函数
const enhancedRequest = flow([
  (fn: typeof request) => withQueue(fn),
  (fn: typeof request) => withCache(fn),
  (fn: typeof request) => withDebounce(fn),
  (fn: typeof request) => withThrottle(fn)
])(request);

// 导出工具函数
export const http = {
  get: <T>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>) =>
    enhancedRequest({ ...config, url, method: 'GET' }) as Promise<T>,
    
  post: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    enhancedRequest({ ...config, url, method: 'POST', data }) as Promise<T>,
    
  put: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    enhancedRequest({ ...config, url, method: 'PUT', data }) as Promise<T>,
    
  delete: <T>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>) =>
    enhancedRequest({ ...config, url, method: 'DELETE' }) as Promise<T>,
    
  patch: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    enhancedRequest({ ...config, url, method: 'PATCH', data }) as Promise<T>,
}; 