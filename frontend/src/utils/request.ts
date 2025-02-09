import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';
import axiosRetry from 'axios-retry';

import { store } from '@/store';
import type { ApiResponse } from '@/types/api';
import { HttpErrorFactory } from '@/utils/http/error/factory';

// 定义请求配置接口
export interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: boolean;
  retryTimes?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 配置请求重试
axiosRetry(request, {
  retries: 1,
  retryDelay: (retryCount: number) => {
    return retryCount * 500;
  },
  retryCondition: (error: AxiosError) => {
    const httpError = HttpErrorFactory.create(error);
    return httpError.code === 'NETWORK_ERROR';
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 处理业务错误
    if (data.code !== 200) {
      const error = HttpErrorFactory.create({
        message: data.message || '请求失败',
        code: data.code.toString(),
        data: data
      } as any);
      return Promise.reject(error);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const httpError = HttpErrorFactory.create(error);

    // 处理 401 错误
    if (httpError.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    // 处理其他 HTTP 错误
    if (error.response?.data) {
      const apiError = error.response.data as ApiResponse<unknown>;
      return Promise.reject(new Error(apiError.message || httpError.message));
    }

    // 处理网络错误
    return Promise.reject(new Error(httpError.message));
  }
);

// 请求函数类型
type RequestMethod = <T>(config: RequestConfig) => Promise<ApiResponse<T>>;

// 包装请求函数
const wrappedRequest: RequestMethod = async <T>(config: RequestConfig) => {
  const response = await request(config);
  return response.data as ApiResponse<T>;
};

export default wrappedRequest; 