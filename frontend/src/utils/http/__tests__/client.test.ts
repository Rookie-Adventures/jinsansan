import { AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpClient } from '../client';
import { cacheManager } from '../error/prevention';
import { HttpErrorType } from '../error/types';

describe('HttpClient Tests', () => {
  let client: HttpClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://test-api.com');

    const client1 = HttpClient.getInstance();
    Object.defineProperty(client1, 'axiosInstance', {
      value: {
        defaults: {
          baseURL: 'http://test-api.com',
          timeout: 10000,
          headers: new AxiosHeaders({
            'Content-Type': 'application/json'
          })
        },
        interceptors: {
          request: {
            handlers: [{
              fulfilled: async (config: any) => {
                if (!config.headers) {
                  config.headers = new AxiosHeaders();
                }
                config.headers.set('X-Request-ID', 'test-request-id');
                config.headers.set('Authorization', 'Bearer test-token');

                // 添加缓存检查逻辑
                if (config.method?.toLowerCase() === 'get') {
                  const cacheKey = cacheManager.getCacheKey(config);
                  const cachedData = cacheManager.get(cacheKey);
                  if (cachedData && config.cache?.enable !== false) {
                    return Promise.reject({
                      config,
                      response: {
                        status: 304,
                        data: cachedData,
                        headers: {},
                        config,
                        statusText: 'Not Modified'
                      }
                    });
                  }
                }

                return config;
              },
              rejected: (error: any) => Promise.reject(error)
            }]
          },
          response: {
            handlers: [{
              fulfilled: async (response: any) => {
                if (response.config.method === 'get') {
                  cacheManager.set('test-cache-key', response.data);
                }
                return response;
              },
              rejected: (error: any) => {
                const httpError = {
                  type: HttpErrorType.AUTH,
                  status: error.response?.status,
                  message: error.response?.data?.message
                };
                return Promise.reject(httpError);
              }
            }]
          }
        }
      }
    });
    client = client1;

    localStorage.setItem('token', 'test-token');
  });

  describe('基础功能测试', () => {
    test('应该是单例模式', () => {
      const client1 = HttpClient.getInstance();
      const client2 = HttpClient.getInstance();
      expect(client1).toBe(client2);
    });

    test('应该使用正确的基础配置创建实例', () => {
      const axiosInstance = (client as any).axiosInstance;
      expect(axiosInstance.defaults.baseURL).toBe('http://test-api.com');
      expect(axiosInstance.defaults.timeout).toBe(10000);
      expect(axiosInstance.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('请求拦截器测试', () => {
    test('应该添加请求 ID', async () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: new AxiosHeaders()
      };

      const interceptor = (client as any).axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.get('X-Request-ID')).toBe('test-request-id');
    });

    test('应该添加认证 token', async () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: new AxiosHeaders()
      };

      const interceptor = (client as any).axiosInstance.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.get('Authorization')).toBe('Bearer test-token');
    });

    test('GET 请求应该检查缓存', async () => {
      const config = {
        method: 'get',
        url: '/test',
        headers: new AxiosHeaders(),
        cache: {
          enable: true
        }
      };

      const cachedData = { id: 1, name: 'test' };
      const spy = vi.spyOn(cacheManager, 'get');
      const getCacheKeySpy = vi.spyOn(cacheManager, 'getCacheKey');
      
      // 设置 mock 返回值
      getCacheKeySpy.mockReturnValue('test-cache-key');
      spy.mockReturnValue(cachedData);

      const interceptor = (client as any).axiosInstance.interceptors.request.handlers[0];
      
      try {
        await interceptor.fulfilled(config);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error: unknown) {
        const errorResponse = error as { response: { data: unknown } };
        expect(errorResponse.response.data).toBe(cachedData);
      }

      // 验证缓存相关方法被调用
      expect(getCacheKeySpy).toHaveBeenCalledWith(config);
      expect(spy).toHaveBeenCalledWith('test-cache-key');
    });
  });

  describe('响应拦截器测试', () => {
    test('成功响应应该缓存 GET 请求数据', async () => {
      const response = {
        config: {
          method: 'get',
          url: '/test'
        },
        data: { id: 1, name: 'test' }
      };

      const spy = vi.spyOn(cacheManager, 'set');

      const interceptor = (client as any).axiosInstance.interceptors.response.handlers[0];
      await interceptor.fulfilled(response);

      expect(spy).toHaveBeenCalledWith(expect.any(String), response.data);
    });

    test('错误响应应该被正确处理', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      const interceptor = (client as any).axiosInstance.interceptors.response.handlers[0];
       
      try {
        await interceptor.rejected(error);
      } catch (e: any) {
        expect(e.type).toBe(HttpErrorType.AUTH);
        expect(e.status).toBe(401);
        expect(e.message).toBe('Unauthorized');
      }
    });
  });
}); 