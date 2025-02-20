import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import type { HttpClient } from '@/types/http';
import type { HttpRequestConfig } from '@/utils/http/types';

import { http } from '@/utils/http';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type HttpMethodFunction<T = unknown> = {
  get: (url: string, config?: HttpRequestConfig) => Promise<T>;
  post: (url: string, data?: unknown, config?: HttpRequestConfig) => Promise<T>;
  put: (url: string, data?: unknown, config?: HttpRequestConfig) => Promise<T>;
  delete: (url: string, config?: HttpRequestConfig) => Promise<T>;
};

/**
 * 创建模拟响应
 */
export const createMockResponse = <T>(data: T): { data: T } => ({ data });

/**
 * 创建网络错误
 */
export const createNetworkError = (message = 'Network error'): Error => new Error(message);

/**
 * HTTP 方法测试配置
 */
export interface TestHttpMethodConfig<T = unknown> {
  method: HttpMethod;
  mockData?: T;
  requestData?: unknown;
  config?: HttpRequestConfig;
}

/**
 * 测试 HTTP 方法
 */
export const testHttpMethod = async <T, H extends HttpMethodFunction<{ data: T }>>({
  method,
  mockData,
  requestData,
  config,
  hook
}: TestHttpMethodConfig<T> & { hook: () => H }): Promise<void> => {
  const mockResponse = createMockResponse(mockData);
  const httpClient = http as unknown as HttpClient;
  vi.mocked(httpClient[method]).mockResolvedValue(mockResponse);

  const { result } = renderHook(hook);
  let response;
  
  if (method === 'get' || method === 'delete') {
    response = await result.current[method]('/test', config);
    expect(httpClient[method]).toHaveBeenCalledWith('/test', config);
  } else {
    response = await result.current[method]('/test', requestData, config);
    expect(httpClient[method]).toHaveBeenCalledWith('/test', requestData, config);
  }

  expect(response).toEqual(mockResponse);
};

/**
 * 测试 HTTP 方法错误处理
 */
export const testHttpMethodError = async <H extends HttpMethodFunction>(
  method: HttpMethod,
  hook: () => H,
  requestData?: unknown
): Promise<void> => {
  const mockError = createNetworkError();
  const httpClient = http as unknown as HttpClient;
  vi.mocked(httpClient[method]).mockRejectedValue(mockError);

  const { result } = renderHook(hook);
  
  if (method === 'get' || method === 'delete') {
    await expect(result.current[method]('/test')).rejects.toThrow('Network error');
  } else {
    await expect(result.current[method]('/test', requestData)).rejects.toThrow('Network error');
  }
};

/**
 * 创建模拟的中止控制器
 */
export const createMockAbortController = (): AbortController => {
  const mockAbortController = new AbortController();
  const abortError = new Error('AbortError');
  abortError.name = 'AbortError';
  return mockAbortController;
}; 