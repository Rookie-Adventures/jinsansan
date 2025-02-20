import { useCallback } from 'react';

import type { HttpRequestConfig } from '@/utils/http/types';

import { http } from '@/utils/http';

type RequestConfig = Omit<HttpRequestConfig, 'url' | 'method'>;
type RequestConfigWithoutData = Omit<HttpRequestConfig, 'url' | 'method' | 'data'>;

interface UseHttpReturn {
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: RequestConfigWithoutData) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: RequestConfigWithoutData) => Promise<T>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>;
}

export const useHttp = (): UseHttpReturn => {
  const get = useCallback(async <T>(url: string, config?: RequestConfig) => {
    return http.get<T>(url, config);
  }, []);

  const post = useCallback(
    async <T>(url: string, data?: unknown, config?: RequestConfigWithoutData) => {
      return http.post<T>(url, data, config);
    },
    []
  );

  const put = useCallback(
    async <T>(url: string, data?: unknown, config?: RequestConfigWithoutData) => {
      return http.put<T>(url, data, config);
    },
    []
  );

  const del = useCallback(async <T>(url: string, config?: RequestConfig) => {
    return http.delete<T>(url, config);
  }, []);

  return {
    get,
    post,
    put,
    delete: del,
  };
};
