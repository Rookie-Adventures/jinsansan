import { debounce, throttle } from 'lodash-es';

import type { HttpRequestConfig } from './types';

type RequestFunction = (config: HttpRequestConfig) => Promise<unknown>;

// 防抖装饰器
export function withDebounce(
  fn: RequestFunction,
  wait: number = 1000,
  options: { leading?: boolean; trailing?: boolean } = {}
): RequestFunction {
  const debouncedFn = debounce(
    (config: HttpRequestConfig, resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => {
      fn(config)
        .then(resolve)
        .catch(reject);
    },
    wait,
    options
  );

  return (config: HttpRequestConfig) => {
    return new Promise((resolve, reject) => {
      debouncedFn(config, resolve, reject);
    });
  };
}

// 节流装饰器
export function withThrottle(
  fn: RequestFunction,
  wait: number = 1000,
  options: { leading?: boolean; trailing?: boolean } = {}
): RequestFunction {
  const throttledFn = throttle(
    (config: HttpRequestConfig, resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => {
      fn(config)
        .then(resolve)
        .catch(reject);
    },
    wait,
    options
  );

  return (config: HttpRequestConfig) => {
    return new Promise((resolve, reject) => {
      throttledFn(config, resolve, reject);
    });
  };
}

// 缓存装饰器
export function withCache(fn: RequestFunction): RequestFunction {
  return async (config: HttpRequestConfig) => {
    if (!config.cache?.enable) {
      return fn(config);
    }

    const { requestManager } = await import('./manager');
    const cacheKey = config.cache.key || requestManager.generateCacheKey(config);
    const cachedData = requestManager.getCacheData(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const data = await fn(config);
    requestManager.setCacheData(cacheKey, data, config.cache.ttl);
    return data;
  };
}

// 队列装饰器
export function withQueue(fn: RequestFunction): RequestFunction {
  return async (config: HttpRequestConfig) => {
    if (!config.queue?.enable) {
      return fn(config);
    }

    const { requestManager } = await import('./manager');
    return new Promise((resolve, reject) => {
      requestManager.addToQueue(config, resolve, reject);
    });
  };
} 