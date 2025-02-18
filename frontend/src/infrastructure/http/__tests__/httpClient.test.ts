import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Logger } from '../../logging/Logger';
import { PerformanceMonitor } from '../../monitoring/PerformanceMonitor';
import { HttpClient } from '../HttpClient';

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
    AxiosError: (actual as any).AxiosError,
  };
});

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockLogger: Logger;
  let mockPerformanceMonitor: PerformanceMonitor;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();

    // 创建 mock
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      getInstance: vi.fn(),
    } as unknown as Logger;

    mockPerformanceMonitor = {
      trackApiCall: vi.fn(),
      getInstance: vi.fn(),
    } as unknown as PerformanceMonitor;

    // Mock axios 实例方法
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    // Mock axios.create 返回 mock 实例
    (axios.create as any).mockReturnValue(mockAxiosInstance);

    // 初始化 HttpClient
    httpClient = new HttpClient(mockLogger, mockPerformanceMonitor);
  });

  describe('构造函数', () => {
    it('应该使用默认配置创建实例', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/api',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
          cache: {
            enable: true,
            ttl: 300000,
          },
          retry: {
            times: 3,
            delay: 1000,
          },
          queue: {
            enable: true,
            concurrency: 3,
          },
        })
      );
    });

    it('应该使用自定义配置覆盖默认配置', () => {
      const customConfig = {
        baseURL: '/custom-api',
        timeout: 5000,
      };

      new HttpClient(mockLogger, mockPerformanceMonitor, customConfig);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/custom-api',
          timeout: 5000,
        })
      );
    });
  });

  describe('HTTP 方法', () => {
    const mockResponse = { data: { id: 1, name: 'test' } };
    const url = '/test';
    const data = { name: 'test' };
    const config = { headers: { 'X-Test': 'test' } };

    beforeEach(() => {
      // 设置所有 HTTP 方法的默认返回值
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);
    });

    describe('GET 方法', () => {
      it('应该正确发送 GET 请求', async () => {
        const result = await httpClient.get(url, config);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(url, config);
        expect(result).toEqual(mockResponse.data);
      });

      it('应该在请求失败时抛出错误', async () => {
        const error = new Error('Network Error');
        mockAxiosInstance.get.mockRejectedValue(error);

        await expect(httpClient.get(url)).rejects.toThrow('Network Error');
      });
    });

    describe('POST 方法', () => {
      it('应该正确发送 POST 请求', async () => {
        const result = await httpClient.post(url, data, config);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, data, config);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('PUT 方法', () => {
      it('应该正确发送 PUT 请求', async () => {
        const result = await httpClient.put(url, data, config);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(url, data, config);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('DELETE 方法', () => {
      it('应该正确发送 DELETE 请求', async () => {
        const result = await httpClient.delete(url, config);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(url, config);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('PATCH 方法', () => {
      it('应该正确发送 PATCH 请求', async () => {
        const result = await httpClient.patch(url, data, config);

        expect(mockAxiosInstance.patch).toHaveBeenCalledWith(url, data, config);
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('拦截器', () => {
    describe('请求拦截器', () => {
      it('应该为请求添加元数据和记录日志', () => {
        // 获取请求拦截器
        const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
        const mockConfig = {
          url: '/test',
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
          params: { id: 1 },
          data: { name: 'test' },
        };

        // 模拟当前时间
        const mockDate = new Date('2024-02-08T00:00:00Z');
        vi.setSystemTime(mockDate);

        // 执行拦截器
        const result = requestInterceptor(mockConfig);

        // 验证元数据
        expect(result.metadata).toEqual({
          startTime: mockDate.getTime(),
        });

        // 验证日志记录
        expect(mockLogger.info).toHaveBeenCalledWith('API Request', {
          url: mockConfig.url,
          method: mockConfig.method,
          headers: mockConfig.headers,
          params: mockConfig.params,
          data: mockConfig.data,
        });
      });

      it('应该处理请求错误并记录日志', async () => {
        // 获取请求错误处理器
        const requestErrorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
        const mockError = new AxiosError();
        mockError.config = {
          url: '/test',
          headers: { 'Content-Type': 'application/json' },
        } as InternalAxiosRequestConfig;

        // 执行错误处理器
        await expect(requestErrorHandler(mockError)).rejects.toThrow();

        // 验证错误日志
        expect(mockLogger.error).toHaveBeenCalledWith('API Request Error', {
          error: mockError.message,
          config: mockError.config,
        });
      });
    });

    describe('响应拦截器', () => {
      it('应该记录响应日志和性能指标', () => {
        // 获取响应拦截器
        const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
        const mockResponse = {
          config: {
            url: '/test',
            headers: { 'Content-Type': 'application/json' },
            metadata: { startTime: Date.now() - 1000 }, // 1秒前
          } as InternalAxiosRequestConfig,
          status: 200,
          data: { id: 1 },
        };

        // 执行拦截器
        const result = responseInterceptor(mockResponse);

        // 验证性能指标记录
        expect(mockPerformanceMonitor.trackApiCall).toHaveBeenCalledWith(
          mockResponse.config.url,
          expect.any(Number),
          true
        );

        // 验证响应日志
        expect(mockLogger.info).toHaveBeenCalledWith('API Response', {
          url: mockResponse.config.url,
          status: mockResponse.status,
          duration: expect.any(Number),
          data: mockResponse.data,
        });

        // 验证返回值
        expect(result).toBe(mockResponse);
      });

      it('应该处理响应错误并记录日志', async () => {
        // 获取响应错误处理器
        const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
        const mockError = new AxiosError();
        mockError.config = {
          url: '/test',
          headers: { 'Content-Type': 'application/json' },
          metadata: { startTime: Date.now() - 1000 },
        } as InternalAxiosRequestConfig;
        mockError.response = {
          status: 500,
          data: { message: 'Internal Server Error' },
        } as any;

        // 执行错误处理器
        await expect(responseErrorHandler(mockError)).rejects.toThrow();

        // 验证性能指标记录
        if (mockError.config?.url) {
          expect(mockPerformanceMonitor.trackApiCall).toHaveBeenCalledWith(
            mockError.config.url,
            expect.any(Number),
            false
          );
        }

        // 验证错误日志
        expect(mockLogger.error).toHaveBeenCalledWith('API Response Error', {
          url: mockError.config?.url,
          status: mockError.response?.status,
          duration: expect.any(Number),
          error: mockError.message,
          response: mockError.response?.data,
        });
      });
    });
  });
});
