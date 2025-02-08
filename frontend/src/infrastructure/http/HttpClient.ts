import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Logger } from '../logging/Logger';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';

// 扩展 AxiosRequestConfig 类型以包含 metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// HTTP 客户端配置接口
interface HttpConfig extends AxiosRequestConfig {
  cache?: {
    enable: boolean;
    ttl?: number;
  };
  retry?: {
    times: number;
    delay: number;
  };
  queue?: {
    enable: boolean;
    concurrency?: number;
  };
  debounce?: {
    wait: number;
    options?: { leading?: boolean; trailing?: boolean };
  };
  throttle?: {
    wait: number;
    options?: { leading?: boolean; trailing?: boolean };
  };
}

export class HttpClient {
  private instance: AxiosInstance;
  private logger: Logger;
  private performanceMonitor: PerformanceMonitor;

  constructor(
    logger: Logger,
    performanceMonitor: PerformanceMonitor,
    config: HttpConfig = {}
  ) {
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

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
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
        this.performanceMonitor.trackApiCall(
          config.url || '',
          duration,
          true
        );

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
          this.performanceMonitor.trackApiCall(
            config.url,
            duration,
            false
          );
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

  // HTTP 方法
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }
}

// 导出默认实例
export const http = new HttpClient(
  Logger.getInstance(),
  PerformanceMonitor.getInstance()
); 