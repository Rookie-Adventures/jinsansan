import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

import { store } from '@/store';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import type { ResponseType } from '@/types/http';

interface ApiErrorData {
  code: number | string;
  message?: string;
  data?: unknown;
}

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
      const errorData: ApiErrorData = {
        message: data.message || '请求失败',
        code: data.code,
        data: data,
      };
      const error = HttpErrorFactory.create(new Error(errorData.message));
      return Promise.reject(error);
    }

    return {
      ...response,
      data: data.data,
    };
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
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as { message?: string };
      return Promise.reject(new Error(errorData.message || httpError.message));
    }

    // 处理网络错误
    return Promise.reject(new Error(httpError.message));
  }
);

// 请求函数类型
type RequestMethod = <_TData>(config: RequestConfig) => Promise<ResponseType<_TData>>;

// 包装请求函数
const wrappedRequest: RequestMethod = async <_TData>(config: RequestConfig) => {
  const response = await request(config);
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers as Record<string, string>
  };
};

export default wrappedRequest;
