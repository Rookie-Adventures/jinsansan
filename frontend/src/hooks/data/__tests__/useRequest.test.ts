// 第三方库导入
import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosHeaders } from 'axios';
import { vi } from 'vitest';

import type { AxiosError } from 'axios';

// 内部模块导入
import { useCache } from '@/hooks/http/useCache';
import { useHttp } from '@/hooks/http/useHttp';

import { useRequest } from '../useRequest';

// 共享的测试数据和类型
interface TestData {
  id: number;
  name: string;
}

interface TestResponse {
  code: number;
  data: TestData;
  message: string;
}

const createTestData = (id: number = 1, name: string = 'test'): TestData => ({
  id,
  name,
});

const createTestResponse = (data: TestData, code: number = 200, message: string = 'success'): TestResponse => ({
  code,
  data,
  message,
});

const createAxiosError = (status: number = 500, message: string = 'Internal server error'): AxiosError => {
  const headers = new AxiosHeaders();
  return {
    name: 'AxiosError',
    message: 'Request failed',
    isAxiosError: true,
    toJSON: () => ({}),
    config: {
      headers,
    },
    response: {
      data: { message },
      status,
      statusText: message,
      headers: {},
      config: {
        headers,
      },
    },
  };
};

// Mock hooks
vi.mock('@/hooks/http/useHttp', () => ({
  useHttp: vi.fn(),
}));

vi.mock('@/hooks/http/useCache', () => ({
  useCache: vi.fn(),
}));

describe('useRequest', () => {
  const mockGet = vi.fn();
  const mockGetCacheData = vi.fn();
  const mockSetCacheData = vi.fn();
  const mockGenerateCacheKey = vi.fn();
  const mockClearCache = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useHttp
    vi.mocked(useHttp).mockReturnValue({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    });

    // Mock useCache
    vi.mocked(useCache).mockReturnValue({
      getCacheData: mockGetCacheData,
      setCacheData: mockSetCacheData,
      generateCacheKey: mockGenerateCacheKey,
      clearCache: mockClearCache,
    });
  });

  describe('基础功能', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useRequest<TestData>('/test'));

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
      expect(typeof result.current.execute).toBe('function');
    });

    it('应该正确处理成功的请求', async () => {
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      expect(result.current.loading).toBeFalsy();

      let response;
      await act(async () => {
        response = await result.current.execute();
      });

      expect(response).toEqual(testData);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(testData);
      expect(mockGet).toHaveBeenCalledWith('/test', expect.any(Object));
    });

    it('应该正确处理失败的请求', async () => {
      const mockError = createAxiosError();
      mockGet.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
    });

    it('应该正确处理请求取消', async () => {
      const abortController = new AbortController();
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      mockGet.mockImplementation((_url, config) => {
        if (config?.signal?.aborted) {
          return Promise.reject(abortError);
        }
        
        return new Promise((_resolve, reject) => {
          const handleAbort = () => {
            config?.signal?.removeEventListener('abort', handleAbort);
            reject(abortError);
          };
          
          config?.signal?.addEventListener('abort', handleAbort);
        });
      });

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      const executePromise = result.current.execute({
        signal: abortController.signal,
      });

      // 立即取消请求
      abortController.abort();

      await expect(executePromise).rejects.toBe(abortError);

      // 等待 loading 状态更新
      await waitFor(() => {
        expect(result.current.loading).toBeFalsy();
      });

      // 等待 error 状态更新
      await waitFor(() => {
        expect(result.current.error).toBe(abortError);
      });

      // 等待 data 状态更新
      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });
    });
  });

  describe('缓存功能', () => {
    it('启用缓存时应该优先返回缓存数据', async () => {
      const cachedData = createTestData(1, 'cached');
      mockGetCacheData.mockReturnValue(cachedData);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      let response;
      await act(async () => {
        response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
        });
      });

      expect(response).toEqual(cachedData);
      expect(result.current.data).toEqual(cachedData);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('缓存未命中时应该发送请求并缓存响应', async () => {
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);
      mockGetCacheData.mockReturnValue(null);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      await act(async () => {
        await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
        });
      });

      expect(mockSetCacheData).toHaveBeenCalledWith('/test', testData, 5000);
      expect(result.current.data).toEqual(testData);
    });

    it('应该使用自定义缓存键', async () => {
      const customCacheKey = 'custom-key';
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);
      mockGetCacheData.mockReturnValue(null);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      await act(async () => {
        await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
            key: customCacheKey,
          },
        });
      });

      expect(mockGetCacheData).toHaveBeenCalledWith(customCacheKey);
      expect(mockSetCacheData).toHaveBeenCalledWith(customCacheKey, testData, 5000);
    });

    it('应该在缓存过期时重新请求数据', async () => {
      const cachedData = createTestData(1, 'cached');
      const newData = createTestData(2, 'new');
      const mockResponse = createTestResponse(newData);

      // 首次返回缓存数据，第二次返回 null（模拟缓存过期）
      mockGetCacheData
        .mockReturnValueOnce(cachedData)
        .mockReturnValueOnce(null);

      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      // 第一次请求，使用缓存数据
      await act(async () => {
        const response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
        });
        expect(response).toEqual(cachedData);
      });

      // 第二次请求，缓存过期，重新获取数据
      await act(async () => {
        const response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
        });
        expect(response).toEqual(newData);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockSetCacheData).toHaveBeenCalledWith('/test', newData, 5000);
    });
  });

  describe('请求配置', () => {
    it('应该合并默认配置和执行配置', async () => {
      const defaultOptions = {
        cache: {
          enable: true,
          ttl: 5000,
        },
      };
      const executeOptions = {
        cache: {
          enable: true,
          ttl: 10000,
          key: 'custom-key',
        },
      };
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useRequest<TestData>('/test', defaultOptions)
      );

      await act(async () => {
        await result.current.execute(executeOptions);
      });

      expect(mockGet).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          cache: {
            enable: true,
            ttl: 10000,
            key: 'custom-key',
          },
        })
      );
    });

    it('应该正确处理队列配置', async () => {
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      await act(async () => {
        await result.current.execute({
          queue: {
            enable: true,
            priority: 1,
          },
        });
      });

      expect(mockGet).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          queue: {
            enable: true,
            priority: 1,
          },
        })
      );
    });

    it('应该支持并发请求限制', async () => {
      const testData1 = createTestData(1, 'test1');
      const testData2 = createTestData(2, 'test2');
      const testData3 = createTestData(3, 'test3');

      const mockResponse1 = createTestResponse(testData1);
      const mockResponse2 = createTestResponse(testData2);
      const mockResponse3 = createTestResponse(testData3);

      const resolvers: ((value: any) => void)[] = [];
      mockGet.mockImplementation(() => new Promise(resolve => {
        resolvers.push(resolve);
      }));

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      // 发起三个并发请求
      const promises = [
        result.current.execute({
          queue: {
            enable: true,
            priority: 1,
          },
        }),
        result.current.execute({
          queue: {
            enable: true,
            priority: 2,
          },
        }),
        result.current.execute({
          queue: {
            enable: true,
            priority: 3,
          },
        }),
      ];

      // 按优先级顺序完成请求
      await act(async () => {
        resolvers[2](mockResponse3);
        resolvers[1](mockResponse2);
        resolvers[0](mockResponse1);
      });

      const results = await Promise.all(promises);
      expect(results).toEqual([testData1, testData2, testData3]);
    });
  });

  describe('状态管理', () => {
    it('应该在请求期间设置正确的 loading 状态', async () => {
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);

      let resolveRequest: (value: any) => void;
      mockGet.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveRequest = resolve;
          })
      );

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      let promise: Promise<any>;
      await act(async () => {
        promise = result.current.execute();
      });

      // 验证 loading 状态为 true
      await waitFor(() => {
        expect(result.current.loading).toBeTruthy();
      });

      // 完成请求
      await act(async () => {
        resolveRequest(mockResponse);
        await promise;
      });

      // 验证 loading 状态恢复为 false
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toEqual(testData);
    });

    it('应该在错误时保持正确的状态', async () => {
      const mockError = createAxiosError(500, 'Server error');
      mockGet.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
    });

    it('应该在重新请求时重置错误状态', async () => {
      const mockError = createAxiosError(500, 'Server error');
      const testData = createTestData();
      const mockResponse = createTestResponse(testData);

      mockGet
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRequest<TestData>('/test'));

      // 第一次请求失败
      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.error).toBe(mockError);

      // 第二次请求成功
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(testData);
    });
  });

  describe('类型安全', () => {
    it('应该正确处理泛型类型', async () => {
      interface ComplexData {
        id: number;
        name: string;
        metadata: {
          createdAt: string;
          updatedAt: string;
        };
        tags: string[];
      }

      const mockComplexData: ComplexData = {
        id: 1,
        name: 'test',
        metadata: {
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        tags: ['tag1', 'tag2'],
      };

      mockGet.mockResolvedValue({ data: mockComplexData });

      const { result } = renderHook(() => useRequest<ComplexData>('/test'));
      const response = await result.current.execute();

      expect(response).toEqual(mockComplexData);
      // 类型检查 - 这些断言在运行时会被执行，但在编译时也会进行类型检查
      expect(typeof response.id).toBe('number');
      expect(typeof response.name).toBe('string');
      expect(Array.isArray(response.tags)).toBe(true);
      expect(response.metadata).toHaveProperty('createdAt');
      expect(response.metadata).toHaveProperty('updatedAt');
    });

    it('应该正确处理联合类型', async () => {
      type ResponseType = { success: true; data: TestData } | { success: false; error: string };

      const testData = createTestData();
      const successResponse: ResponseType = { success: true, data: testData };
      const errorResponse: ResponseType = { success: false, error: 'Not found' };

      mockGet
        .mockResolvedValueOnce({ data: successResponse })
        .mockResolvedValueOnce({ data: errorResponse });

      const { result } = renderHook(() => useRequest<ResponseType>('/test'));
      
      const response1 = await result.current.execute();
      expect(response1.success).toBe(true);
      if (response1.success) {
        expect(response1.data).toEqual(testData);
      }

      const response2 = await result.current.execute();
      expect(response2.success).toBe(false);
      if (!response2.success) {
        expect(response2.error).toBe('Not found');
      }
    });
  });
});
