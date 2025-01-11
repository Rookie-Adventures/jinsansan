import axios, { 
  AxiosError, 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';
import axiosRetry from 'axios-retry';

import { store } from '@/store';
import type { ApiResponse } from '@/types/api';
import { getErrorMessage, isNetworkError } from '@/utils/errorHandler';

// 定义请求配置接口
export interface RequestConfig extends InternalAxiosRequestConfig {
  retry?: boolean;
  retryTimes?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 配置请求重试
axiosRetry(request, {
  retries: 3, // 最大重试次数
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 重试延迟时间（毫秒）
  },
  retryCondition: (error: AxiosError) => {
    // 只在网络错误或 5xx 错误时重试
    return (
      isNetworkError(error) || 
      (error.response?.status ? error.response.status >= 500 : false)
    );
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
      return Promise.reject(new Error(data.message));
    }
    
    return Promise.resolve(response);
  },
  async (error: AxiosError) => {
    // 处理 401 错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    // 处理其他错误
    return Promise.reject(new Error(getErrorMessage(error)));
  }
);

// 请求函数类型
type RequestMethod = <T>(config: RequestConfig) => Promise<ApiResponse<T>>;

// 包装请求函数
const wrappedRequest: RequestMethod = async <T>(config: RequestConfig) => {
  try {
    const response = await request(config);
    return response.data as ApiResponse<T>;
  } catch (error) {
    throw error;
  }
};

export default wrappedRequest; 