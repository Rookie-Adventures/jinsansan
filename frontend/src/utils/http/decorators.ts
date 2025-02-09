import { debounce, throttle } from 'lodash-es';

import type { HttpRequestConfig } from './types';
import { requestManager } from './manager';

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
  return (config: HttpRequestConfig) => {
    // 如果队列未启用，直接执行原函数
    if (!config.queue?.enable) {
      return fn(config);
    }

    // 返回一个新的 Promise
    return new Promise((resolve, reject) => {
      // 添加到请求队列
      requestManager.addToQueue(
        config,
        () => {
          // 执行原函数并处理结果
          fn(config)
            .then(resolve)
            .catch(reject);
        },
        reject
      );
    });
  };
} 