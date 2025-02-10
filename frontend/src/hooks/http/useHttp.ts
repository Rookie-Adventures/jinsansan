import { useCallback } from 'react';

import { http } from '@/utils/http';
import type { HttpRequestConfig } from '@/utils/http/types';

type RequestConfig = Omit<HttpRequestConfig, 'url' | 'method'>;
type RequestConfigWithoutData = Omit<HttpRequestConfig, 'url' | 'method' | 'data'>;

export const useHttp = () => {
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
