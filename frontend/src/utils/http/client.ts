import type { HttpRequestConfig } from './types';
import type { AxiosRequestHeaders } from 'axios';

import request from '../request';

import { RequestMethod } from './types';

/**
 * HTTP 客户端实现类
 * @implements {RequestMethod}
 */
class HttpClient implements RequestMethod {
  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'GET',
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'POST',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'PUT',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'DELETE',
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }
}

export const http = new HttpClient();
