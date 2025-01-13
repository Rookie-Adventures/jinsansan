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

// 创建基础配置
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

// 获取单例实例
const logger = Logger.getInstance();
const performanceMonitor = PerformanceMonitor.getInstance();

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create(defaultConfig);

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 记录请求开始时间
    config.metadata = { startTime: Date.now() };
    
    // 记录请求日志
    logger.info('API Request', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    logger.error('API Request Error', {
      error: error.message,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { config } = response;
    const duration = Date.now() - (config.metadata?.startTime || 0);

    // 记录性能指标
    performanceMonitor.trackApiCall(
      config.url || '',
      duration,
      true
    );

    // 记录响应日志
    logger.info('API Response', {
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
      performanceMonitor.trackApiCall(
        config.url,
        duration,
        false
      );
    }

    // 记录错误日志
    logger.error('API Response Error', {
      url: config?.url,
      status: error.response?.status,
      duration,
      error: error.message,
      response: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// 导出 http 实例
export const http = axiosInstance; 