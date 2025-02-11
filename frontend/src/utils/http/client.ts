import request from '../request';
import type { HttpRequestConfig, RequestMethod } from './types';
import type { AxiosRequestHeaders } from 'axios';
import type { ResponseType } from '../../types/http';

class HttpClient implements RequestMethod {
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    config?: HttpRequestConfig & { data?: Record<string, unknown> }
  ): Promise<ResponseType<T>> {
    const response = await request<T>({
      ...config,
      url,
      method,
      headers: (config?.headers || {}) as AxiosRequestHeaders,
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>> {
    return this.makeRequest<T>('GET', url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: HttpRequestConfig
  ): Promise<ResponseType<T>> {
    return this.makeRequest<T>('POST', url, { ...config, data });
  }

  async put<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: HttpRequestConfig
  ): Promise<ResponseType<T>> {
    return this.makeRequest<T>('PUT', url, { ...config, data });
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ResponseType<T>> {
    return this.makeRequest<T>('DELETE', url, config);
  }
}

export const http = new HttpClient();
