import { useCallback } from 'react';

import { requestManager } from '@/utils/http';

export const useCache = () => {
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