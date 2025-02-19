import type { HttpRequestConfig } from './types';
import type { AxiosRequestHeaders } from 'axios';

import request from '../request';

import { RequestMethod } from './types';

class HttpClient implements RequestMethod {
  async get<T = any>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'GET',
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'POST',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<T> {
    const response = await request<T>({
      ...config,
      url,
      method: 'PUT',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return response.data;
  }

  async delete<T = any>(url: string, config?: HttpRequestConfig): Promise<T> {
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
