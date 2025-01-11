import axios, { AxiosInstance } from 'axios';

import type { RequestManager, HttpRequestConfig, CacheData, QueueItem } from './types';

class HttpRequestManager implements RequestManager {
  private static instance: HttpRequestManager;
  private axiosInstance: AxiosInstance;
  public cache: Map<string, CacheData>;
  public cancelTokens: Map<string, AbortController>;
  public queue: QueueItem[];

  private constructor() {
    this.axiosInstance = axios.create();
    this.cache = new Map();
    this.cancelTokens = new Map();
    this.queue = [];
  }

  public static getInstance(): HttpRequestManager {
    if (!HttpRequestManager.instance) {
      HttpRequestManager.instance = new HttpRequestManager();
    }
    return HttpRequestManager.instance;
  }

  // 生成缓存键
  public generateCacheKey(config: HttpRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
  }

  // 获取缓存数据
  public getCacheData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp, ttl } = cached;
    const now = Date.now();

    // 检查缓存是否过期
    if (now - timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return data as T;
  }

  // 设置缓存数据
  public setCacheData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // 取消请求
  public cancelRequest(token: string): void {
    const controller = this.cancelTokens.get(token);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(token);
    }
  }

  // 取消所有请求
  public cancelAllRequests(): void {
    this.cancelTokens.forEach((controller) => controller.abort());
    this.cancelTokens.clear();
  }

  // 添加到请求队列
  public addToQueue(
    config: HttpRequestConfig,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void
  ): void {
    this.queue.push({
      config,
      resolve,
      reject,
      priority: config.queue?.priority || 0,
    });

    // 按优先级排序
    this.queue.sort((a: QueueItem, b: QueueItem) => b.priority - a.priority);
    this.processQueue();
  }

  // 处理队列
  public async processQueue(): Promise<void> {
    const maxConcurrency = 3; // 默认最大并发数
    const processing = new Set<Promise<void>>();

    while (this.queue.length > 0) {
      if (processing.size >= maxConcurrency) {
        await Promise.race(processing);
      }

      const request = this.queue.shift();
      if (!request) continue;

      const { config, resolve, reject } = request;
      const promise = this.executeRequest(config)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          processing.delete(promise);
        });

      processing.add(promise);
    }

    await Promise.all(processing);
  }

  // 执行请求
  private async executeRequest(config: HttpRequestConfig): Promise<unknown> {
    try {
      // 处理缓存
      if (config.cache?.enable) {
        const cacheKey = config.cache.key || this.generateCacheKey(config);
        const cachedData = this.getCacheData(cacheKey);
        if (cachedData) return cachedData;
      }

      // 创建取消令牌
      if (config.cancelTokenId) {
        const controller = new AbortController();
        this.cancelTokens.set(config.cancelTokenId, controller);
        config.signal = controller.signal;
      }

      const response = await this.axiosInstance.request(config);

      // 设置缓存
      if (config.cache?.enable) {
        const cacheKey = config.cache.key || this.generateCacheKey(config);
        this.setCacheData(cacheKey, response.data, config.cache.ttl);
      }

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('请求已取消');
      }
      throw error;
    }
  }
}

export const requestManager = HttpRequestManager.getInstance(); 