import request from '../request';
import type { HttpRequestConfig, RequestMethod } from './types';
import type { AxiosRequestHeaders } from 'axios';
import type { ResponseType } from '../../types/http';

class HttpClient implements RequestMethod {
  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>> {
    const response = await request<T>({
      ...config,
      url,
      method: 'GET',
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  async post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: HttpRequestConfig
  ): Promise<ResponseType<T>> {
    const response = await request<T>({
      ...config,
      url,
      method: 'POST',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  async put<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: HttpRequestConfig
  ): Promise<ResponseType<T>> {
    const response = await request<T>({
      ...config,
      url,
      method: 'PUT',
      data,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>> {
    const response = await request<T>({
      ...config,
      url,
      method: 'DELETE',
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }
}

export const http = new HttpClient();
