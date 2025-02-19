import { useCallback, useState } from 'react';

import type { HttpRequestConfig } from '@/utils/http/types';
import type { AxiosError } from 'axios';

import { useCache } from '@/hooks/http/useCache';
import { useHttp } from '@/hooks/http/useHttp';


interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface RequestOptions {
  cache?: {
    enable: boolean;
    ttl: number;
    key?: string;
  };
  queue?: {
    enable: boolean;
    priority: number;
  };
}

interface UseRequestResult<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
  execute: (options?: RequestOptions) => Promise<T>;
}

interface RequestState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
  setLoading: (value: boolean) => void;
  setError: (error: Error | null) => void;
  setData: (data: T | null) => void;
}

interface RequestExecuteConfig<T> {
  url: string;
  defaultOptions?: RequestOptions;
  state: RequestState<T>;
  handlers: ReturnType<typeof useRequestHandlers<T>>;
  get: ReturnType<typeof useHttp>['get'];
}

const createFinalOptions = (
  defaultOptions?: RequestOptions,
  options?: RequestOptions
): HttpRequestConfig => ({
  ...defaultOptions,
  ...options,
  cache: options?.cache
    ? {
        enable: options.cache.enable,
        ttl: options.cache.ttl,
        key: options.cache.key,
      }
    : undefined,
  queue: options?.queue
    ? {
        enable: options.queue.enable,
        priority: options.queue.priority,
      }
    : undefined,
});

const useRequestState = <T>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  return {
    loading,
    error,
    data,
    setLoading,
    setError,
    setData,
  };
};

const useRequestHandlers = <T>(state: RequestState<T>, cache: ReturnType<typeof useCache>) => {
  const handleCacheData = useCallback(
    (cacheKey: string): T | null => {
      const cachedData = cache.getCacheData<T>(cacheKey);
      if (cachedData) {
        state.setData(cachedData);
        return cachedData;
      }
      return null;
    },
    [cache, state]
  );

  const handleResponseData = useCallback(
    (responseData: ApiResponse<T>, cacheKey?: string, ttl?: number) => {
      const newData = responseData.data;
      state.setData(newData);
      if (cacheKey && ttl) {
        cache.setCacheData(cacheKey, newData, ttl);
      }
      return newData;
    },
    [cache, state]
  );

  return {
    handleCacheData,
    handleResponseData,
  };
};

const useRequestExecute = <T>({
  url,
  defaultOptions,
  state,
  handlers,
  get,
}: RequestExecuteConfig<T>) => {
  return useCallback(
    async (options?: RequestOptions): Promise<T> => {
      const finalOptions = createFinalOptions(defaultOptions, options);
      state.setLoading(true);
      state.setError(null);

      try {
        if (finalOptions?.cache?.enable) {
          const cacheKey = finalOptions.cache.key || url;
          const cachedData = handlers.handleCacheData(cacheKey);
          if (cachedData) {
            state.setLoading(false);
            return cachedData;
          }
        }

        const response = await get<ApiResponse<T>>(url, finalOptions);
        return handlers.handleResponseData(
          response,
          finalOptions?.cache?.enable ? finalOptions.cache.key || url : undefined,
          finalOptions?.cache?.ttl
        );
      } catch (err) {
        const error = err as AxiosError;
        state.setError(error);
        throw error;
      } finally {
        state.setLoading(false);
      }
    },
    [url, defaultOptions, state, handlers, get]
  );
};

export const useRequest = <T>(
  url: string,
  defaultOptions?: RequestOptions
): UseRequestResult<T> => {
  const state = useRequestState<T>();
  const { get } = useHttp();
  const cache = useCache();
  const handlers = useRequestHandlers(state, cache);
  const execute = useRequestExecute({
    url,
    defaultOptions,
    state,
    handlers,
    get,
  });

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    execute,
  };
};
