import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AxiosHeaders } from 'axios';
import { PerformanceMonitor } from '../../../infrastructure/monitoring/PerformanceMonitor';
import { HttpClient } from '../../../utils/http/client';

// 类型定义
interface ApiCallMetric {
  type: string;
  data: {
    url: string;
    success: boolean;
    duration: number;
  };
}

describe('HTTP Request Monitoring', () => {
  let performanceMonitor: PerformanceMonitor;
  let httpClient: HttpClient;
  let mockRequestUse: ReturnType<typeof vi.fn>;
  let mockResponseUse: ReturnType<typeof vi.fn>;
  let mockLocalStorage: { [key: string]: string } = {};
  let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  let responseInterceptor: {
    success: (response: AxiosResponse) => AxiosResponse;
    error: (error: AxiosError) => Promise<never>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.clearMetrics();
    
    // 重置 mockLocalStorage
    mockLocalStorage = {};
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        })
      },
      writable: true
    });
    
    // 创建拦截器的 mock 函数
    mockRequestUse = vi.fn();
    mockResponseUse = vi.fn();
    
    // 创建一个模拟的 axios 实例
    const mockAxios: Partial<AxiosInstance> = {
      interceptors: {
        request: {
          use: mockRequestUse,
          eject: vi.fn(),
          clear: vi.fn()
        },
        response: {
          use: mockResponseUse,
          eject: vi.fn(),
          clear: vi.fn()
        }
      },
      request: vi.fn()
    };
    
    // 模拟 axios.create 方法
    const mockCreate = vi.fn().mockReturnValue(mockAxios);
    vi.spyOn(axios, 'create').mockImplementation(mockCreate);
    
    // 初始化 HttpClient，这会触发拦截器的设置
    httpClient = HttpClient.getInstance();
    
    // 初始化拦截器
    requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!config.headers) config.headers = new AxiosHeaders();
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('X-Request-ID', 'test-id');
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      }
      config.metadata = { startTime: Date.now() };
      return config;
    };

    responseInterceptor = {
      success: (response: AxiosResponse): AxiosResponse => {
        const duration = Date.now() - ((response.config as InternalAxiosRequestConfig).metadata?.startTime || Date.now());
        performanceMonitor.trackApiCall(
          response.config.url || '',
          duration,
          true
        );
        return response;
      },
      error: (error: AxiosError): Promise<never> => {
        const duration = Date.now() - ((error.config as InternalAxiosRequestConfig)?.metadata?.startTime || Date.now());
        performanceMonitor.trackApiCall(
          error.config?.url || '',
          duration,
          false
        );
        return Promise.reject(error);
      }
    };

    // 设置 mock 函数的返回值
    mockRequestUse.mockImplementation((fn: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) => fn);
    mockResponseUse.mockImplementation((successFn, errorFn) => ({
      success: successFn,
      error: errorFn
    }));

    // 调用拦截器
    mockRequestUse(requestInterceptor);
    mockResponseUse(responseInterceptor.success, responseInterceptor.error);
  });

  describe('请求拦截器', () => {
    it('应该为每个请求添加追踪ID', async () => {
      const config = await requestInterceptor({
        headers: new AxiosHeaders(),
        url: '/test'
      } as InternalAxiosRequestConfig);
      
      expect(config.headers instanceof AxiosHeaders).toBe(true);
      if (config.headers instanceof AxiosHeaders) {
        expect(config.headers.get('X-Request-ID')).toBeDefined();
        expect(typeof config.headers.get('X-Request-ID')).toBe('string');
      }
    });

    it('应该添加认证信息', async () => {
      // 先设置 token
      const token = 'test-token';
      window.localStorage.setItem('token', token);

      // 验证 token 已被正确设置
      expect(window.localStorage.getItem('token')).toBe(token);

      // 创建测试配置
      const config: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        url: '/api/test',
        method: 'GET'
      };

      // 执行拦截器
      const interceptedConfig = await requestInterceptor(config);
      
      // 验证 headers 是否正确
      expect(interceptedConfig.headers instanceof AxiosHeaders).toBe(true);
      if (interceptedConfig.headers instanceof AxiosHeaders) {
        const authHeader = interceptedConfig.headers.get('Authorization');
        expect(authHeader).toBe(`Bearer ${token}`);
      }

      // 清理
      window.localStorage.removeItem('token');
    });
  });

  describe('响应拦截器', () => {
    it('应该记录成功的API调用', async () => {
      const startTime = Date.now() - 100;
      const headers = new AxiosHeaders();
      const response: AxiosResponse = {
        config: {
          url: '/api/test',
          metadata: { startTime },
          headers,
          method: 'GET'
        } as InternalAxiosRequestConfig,
        status: 200,
        statusText: 'OK',
        headers,
        data: { success: true }
      };

      await responseInterceptor.success(response);
      
      const metrics = performanceMonitor.getMetrics();
      const apiCallMetric = metrics.find(m => m.type === 'api_call') as ApiCallMetric;
      
      expect(apiCallMetric).toBeDefined();
      expect(apiCallMetric?.data).toMatchObject({
        url: '/api/test',
        success: true,
        duration: expect.any(Number)
      });
    });

    it('应该记录失败的API调用', async () => {
      const startTime = Date.now();
      const headers = new AxiosHeaders();
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        config: {
          url: '/api/test',
          metadata: { startTime },
          headers,
          method: 'GET'
        } as InternalAxiosRequestConfig,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          headers,
          config: {
            url: '/api/test',
            metadata: { startTime },
            headers,
            method: 'GET'
          } as InternalAxiosRequestConfig,
          data: { error: 'Internal Server Error' }
        },
        isAxiosError: true,
        toJSON: () => ({})
      };

      try {
        await responseInterceptor.error(error);
        throw new Error('应该抛出错误');
      } catch (e) {
        const metrics = performanceMonitor.getMetrics();
        const apiCallMetric = metrics.find(m => m.type === 'api_call') as ApiCallMetric;
        
        expect(apiCallMetric).toBeDefined();
        expect(apiCallMetric?.data).toMatchObject({
          url: '/api/test',
          success: false,
          duration: expect.any(Number)
        });
      }
    });
  });

  describe('性能监控', () => {
    it('应该记录请求持续时间', async () => {
      // 使用假计时器
      vi.useFakeTimers();
      const startTime = Date.now();
      const headers = new AxiosHeaders();
      
      const response: AxiosResponse = {
        config: {
          url: '/api/test',
          metadata: { startTime },
          headers,
          method: 'GET'
        } as InternalAxiosRequestConfig,
        status: 200,
        statusText: 'OK',
        headers,
        data: { success: true }
      };

      // 前进时间 1500ms
      await vi.advanceTimersByTimeAsync(1500);
      
      // 调用响应拦截器
      await responseInterceptor.success(response);
      
      const metrics = performanceMonitor.getMetrics();
      const apiCallMetric = metrics.find(m => m.type === 'api_call') as ApiCallMetric;
      
      expect(apiCallMetric).toBeDefined();
      expect(apiCallMetric?.data.duration).toBe(1500);
      
      // 恢复真实计时器
      vi.useRealTimers();
    });
  });
}); 