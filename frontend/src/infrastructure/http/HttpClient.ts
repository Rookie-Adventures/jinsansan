import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create(defaultConfig);

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 导出 http 实例
export const http = axiosInstance; 