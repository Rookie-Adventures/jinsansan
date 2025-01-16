import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { defaultErrorHandler, HttpErrorFactory } from './error/index';
import { errorPreventionManager, RequestValidator, cacheManager } from './error/prevention';

// 扩展 AxiosRequestConfig 类型
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  cached?: boolean;
}

export class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const extendedConfig = config as ExtendedAxiosRequestConfig;
        // 添加请求追踪 ID
        if (!extendedConfig.headers) {
          extendedConfig.headers = new AxiosHeaders();
        }
        extendedConfig.headers['X-Request-ID'] = uuidv4();

        // 运行错误预防规则
        await errorPreventionManager.checkRules(extendedConfig);

        // 验证请求
        RequestValidator.validateRequest(extendedConfig);

        // 检查缓存
        if (extendedConfig.method?.toLowerCase() === 'get') {
          const cacheKey = cacheManager.getCacheKey(extendedConfig);
          const cachedData = cacheManager.get(cacheKey);
          if (cachedData) {
            extendedConfig.cached = true;
            extendedConfig.data = cachedData;
            return extendedConfig;
          }
        }

        // 添加认证信息
        const token = localStorage.getItem('token');
        if (token) {
          extendedConfig.headers.set('Authorization', `Bearer ${token}`);
        }

        return extendedConfig;
      },
      (error) => {
        return Promise.reject(HttpErrorFactory.create(error));
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as ExtendedAxiosRequestConfig;
        // 处理缓存
        if (config.method?.toLowerCase() === 'get' && !config.cached) {
          const cacheKey = cacheManager.getCacheKey(config);
          cacheManager.set(cacheKey, response.data);
        }

        return response;
      },
      async (error) => {
        const httpError = HttpErrorFactory.create(error);

        // 尝试错误恢复
        try {
          await defaultErrorHandler.handle(httpError);
        } catch (e) {
          console.error('Error recovery failed:', e);
        }

        return Promise.reject(httpError);
      }
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      throw HttpErrorFactory.create(error);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'get', url });
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'post', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'put', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'delete', url });
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'patch', url, data });
  }
}

export const httpClient = HttpClient.getInstance(); 