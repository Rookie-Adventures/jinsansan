import { useCallback } from 'react';

import { requestManager } from '@/utils/http';

interface UseCacheReturn {
  getCacheData: <T>(key: string) => T | null;
  setCacheData: <T>(key: string, data: T, ttl?: number) => void;
  generateCacheKey: (config: Record<string, unknown>) => string;
  clearCache: (key?: string) => void;
}

export const useCache = (): UseCacheReturn => {
  const getCacheData = useCallback(<T>(key: string): T | null => {
    return requestManager.getCacheData<T>(key);
  }, []);

  const setCacheData = useCallback(<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
    requestManager.setCacheData(key, data, ttl);
  }, []);

  const generateCacheKey = useCallback((config: Record<string, unknown>): string => {
    return requestManager.generateCacheKey(config);
  }, []);

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      requestManager.cache.delete(key);
    } else {
      requestManager.cache.clear();
    }
  }, []);

  return {
    getCacheData,
    setCacheData,
    generateCacheKey,
    clearCache,
  };
};
