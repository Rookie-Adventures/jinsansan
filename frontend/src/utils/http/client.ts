import axios, { AxiosInstance } from 'axios';
import type { AxiosRequestConfig } from 'axios';

import { DefaultErrorHandler, HttpErrorFactory } from './error';
import { setupInterceptors } from './interceptors';
import { requestManager } from './manager';
import { retry } from './retry';
import type { HttpRequestConfig, ApiResponse } from './types';

// 创建基础 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 设置拦截器
setupInterceptors(axiosInstance);

// 默认错误处理器
const defaultErrorHandler = new DefaultErrorHandler();

// 基础请求函数
async function request<T = unknown>(config: HttpRequestConfig): Promise<T> {
  try {
    // 处理请求取消
    if (config.cancelTokenId) {
      const controller = new AbortController();
      requestManager.cancelTokens.set(config.cancelTokenId, controller);
      config.signal = controller.signal;
    }

    // 包装请求函数
    const makeRequest = () => axiosInstance.request<ApiResponse<T>>(config);

    // 如果启用了重试，使用重试包装器
    const response = config.retry?.times
      ? await retry(makeRequest, config.retry)
      : await makeRequest();

    // 如果请求有ID，从队列中移除
    if (config.cancelTokenId) {
      requestManager.cancelTokens.delete(config.cancelTokenId);
    }

    return response.data.data;
  } catch (error) {
    // 转换错误
    const httpError = HttpErrorFactory.create(error);

    // 使用自定义错误处理器或默认错误处理器
    const handler = config.errorHandler || defaultErrorHandler;
    await handler.handle(httpError);

    throw httpError;
  }
}

// 导出工具函数
export const http = {
  get: <T>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>) =>
    request<T>({ ...config, url, method: 'GET' }),
    
  post: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    request<T>({ ...config, url, method: 'POST', data }),
    
  put: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    request<T>({ ...config, url, method: 'PUT', data }),
    
  delete: <T>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>) =>
    request<T>({ ...config, url, method: 'DELETE' }),
    
  patch: <T>(url: string, data?: unknown, config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>) =>
    request<T>({ ...config, url, method: 'PATCH', data }),
}; 