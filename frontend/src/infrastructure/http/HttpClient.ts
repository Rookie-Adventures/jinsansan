import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { Logger } from '../logging/Logger';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';

/**
 * 扩展 Axios 请求配置以包含元数据
 */
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
  }
}

/**
 * 请求元数据接口
 */
interface RequestMetadata {
  /** 请求开始时间 */
  startTime: number;
}

/**
 * HTTP 响应数据基础接口
 */
export interface BaseResponse<T> {
  /** 响应数据 */
  data: T;
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
}

/**
 * HTTP 请求数据基础接口
 */
export type BaseRequest = Record<string, unknown> | FormData;

/**
 * HTTP 客户端配置接口
 */
interface HttpConfig extends AxiosRequestConfig {
  /** 缓存配置 */
  cache?: {
    /** 是否启用缓存 */
    enable: boolean;
    /** 缓存时间（毫秒） */
    ttl?: number;
  };
  /** 重试配置 */
  retry?: {
    /** 重试次数 */
    times: number;
    /** 重试延迟（毫秒） */
    delay: number;
  };
  /** 队列配置 */
  queue?: {
    /** 是否启用队列 */
    enable: boolean;
    /** 并发数 */
    concurrency?: number;
  };
  /** 防抖配置 */
  debounce?: {
    /** 等待时间（毫秒） */
    wait: number;
    /** 配置选项 */
    options?: { leading?: boolean; trailing?: boolean };
  };
  /** 节流配置 */
  throttle?: {
    /** 等待时间（毫秒） */
    wait: number;
    /** 配置选项 */
    options?: { leading?: boolean; trailing?: boolean };
  };
}

/**
 * HTTP 客户端类
 * @description 封装了 Axios，提供了统一的 HTTP 请求接口
 */
export class HttpClient {
  private instance: AxiosInstance;
  private logger: Logger;
  private performanceMonitor: PerformanceMonitor;

  constructor(logger: Logger, performanceMonitor: PerformanceMonitor, config: HttpConfig = {}) {
    this.logger = logger;
    this.performanceMonitor = performanceMonitor;

    // 合并默认配置
    const defaultConfig: HttpConfig = {
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: {
        enable: true,
        ttl: 5 * 60 * 1000, // 5分钟
      },
      retry: {
        times: 3,
        delay: 1000,
      },
      queue: {
        enable: true,
        concurrency: 3,
      },
    };

    this.instance = axios.create({ ...defaultConfig, ...config });
    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      config => {
        // 记录请求开始时间
        config.metadata = { startTime: Date.now() };

        // 记录请求日志
        this.logger.info('API Request', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error: AxiosError) => {
        this.logger.error('API Request Error', {
          error: error.message,
          config: error.config,
        });
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { config } = response;
        const duration = Date.now() - (config.metadata?.startTime || 0);

        // 记录性能指标
        this.performanceMonitor.trackApiCall(config.url || '', duration, true);

        // 记录响应日志
        this.logger.info('API Response', {
          url: config.url,
          status: response.status,
          duration,
          data: response.data,
        });

        return response;
      },
      (error: AxiosError) => {
        const { config } = error;
        const duration = Date.now() - (config?.metadata?.startTime || 0);

        // 记录性能指标
        if (config?.url) {
          this.performanceMonitor.trackApiCall(config.url, duration, false);
        }

        // 记录错误日志
        this.logger.error('API Response Error', {
          url: config?.url,
          status: error.response?.status,
          duration,
          error: error.message,
          response: error.response?.data,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * 发送 GET 请求
   * @param url - 请求地址
   * @param config - 请求配置
   * @returns 响应数据
   */
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<BaseResponse<T>> {
    const response = await this.instance.get<BaseResponse<T>>(url, config);
    return response.data;
  }

  /**
   * 发送 POST 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns 响应数据
   */
  public async post<T, D extends BaseRequest = BaseRequest>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<BaseResponse<T>> {
    const response = await this.instance.post<BaseResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * 发送 PUT 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns 响应数据
   */
  public async put<T, D extends BaseRequest = BaseRequest>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<BaseResponse<T>> {
    const response = await this.instance.put<BaseResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * 发送 DELETE 请求
   * @param url - 请求地址
   * @param config - 请求配置
   * @returns 响应数据
   */
  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<BaseResponse<T>> {
    const response = await this.instance.delete<BaseResponse<T>>(url, config);
    return response.data;
  }

  /**
   * 发送 PATCH 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns 响应数据
   */
  public async patch<T, D extends BaseRequest = BaseRequest>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<BaseResponse<T>> {
    const response = await this.instance.patch<BaseResponse<T>>(url, data, config);
    return response.data;
  }
}

// 导出默认实例
export const http = new HttpClient(Logger.getInstance(), PerformanceMonitor.getInstance());
