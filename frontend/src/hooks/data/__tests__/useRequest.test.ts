// 第三方库导入
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';

// 内部模块导入
import type { RequestOptions } from '../useRequest';
import type { HttpMethod } from '@/utils/http/types';

import { useCache } from '@/hooks/http/useCache';
import { useHttp } from '@/hooks/http/useHttp';
import {
  type AxiosError,
  type TestData,
  type ComplexTestData,
  type TestResponse,
  type UnionResponseType,
  createTestData,
  createTestResponse,
  createAxiosError,
  expectTypeChecks,
  createUnionResponses,
  createComplexTestData,
} from '@/tests/utils/http-test-utils';

import { useRequest } from '../useRequest';

// Mock hooks
vi.mock('@/hooks/http/useHttp', () => ({
  useHttp: vi.fn(),
}));

vi.mock('@/hooks/http/useCache', () => ({
  useCache: vi.fn(),
}));

// Mock HTTP client
const mockGet = vi.fn();
vi.mock('@/utils/http', () => ({
  httpClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

// Mock cache utilities
const mockGetCacheData = vi.fn();
const mockSetCacheData = vi.fn();
vi.mock('@/utils/cache', () => ({
  getCacheData: (...args: unknown[]) => mockGetCacheData(...args),
  setCacheData: (...args: unknown[]) => mockSetCacheData(...args),
}));

describe('useRequest', () => {
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
        response = await result.current.execute({
          method: 'GET',
        });
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
      await expectErrorHandling(result, mockError);
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
        method: 'GET',
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
      const { testData, result } = setupRequestTest();
      mockGetCacheData.mockReturnValue(testData);

      let response;
      await act(async () => {
        response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
          method: 'GET',
        });
      });
      
      expect(response).toEqual(testData);
      expect(result.current.data).toEqual(testData);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('缓存未命中时应该发送请求并缓存响应', async () => {
      const { testData, result } = setupRequestTest();
      mockGetCacheData.mockReturnValue(null);

      await executeRequestWithCache(result);

      expect(mockSetCacheData).toHaveBeenCalledWith('/test', testData, 5000);
      expect(result.current.data).toEqual(testData);
    });

    it('应该使用自定义缓存键', async () => {
      const customCacheKey = 'custom-key';
      const { testData, result } = setupRequestTest();
      mockGetCacheData.mockReturnValue(null);

      await executeRequestWithCache(result, { key: customCacheKey, method: 'GET' });

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
      let response;
      await act(async () => {
        response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
          method: 'GET',
        });
      });

      expect(response).toEqual(cachedData);
      expect(result.current.data).toEqual(cachedData);

      // 第二次请求，缓存过期，重新获取数据
      await act(async () => {
        response = await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
          method: 'GET',
        });
      });

      expect(response).toEqual(newData);
      expect(result.current.data).toEqual(newData);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockSetCacheData).toHaveBeenCalledWith('/test', newData, 5000);
    });
  });

  describe('请求配置', () => {
    it('应该合并默认配置和执行配置', async () => {
      const defaultOptions: RequestOptions = {
        cache: {
          enable: true,
          ttl: 5000,
        },
        method: 'GET' as HttpMethod,
      };
      const executeOptions: RequestOptions = {
        cache: {
          enable: true,
          ttl: 10000,
          key: 'custom-key',
        },
        method: 'GET' as HttpMethod,
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
          method: 'GET',
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
          method: 'GET',
        }),
        result.current.execute({
          queue: {
            enable: true,
            priority: 2,
          },
          method: 'GET',
        }),
        result.current.execute({
          queue: {
            enable: true,
            priority: 3,
          },
          method: 'GET',
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
        promise = result.current.execute({
          method: 'GET',
        });
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
      await expectErrorHandling(result, mockError);
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
          await result.current.execute({
            method: 'GET',
          });
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.error).toBe(mockError);

      // 第二次请求成功
      await act(async () => {
        await result.current.execute({
          method: 'GET',
        });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(testData);
    });
  });

  describe('类型安全', () => {
    it('应该正确处理泛型类型', async () => {
      const mockComplexData = createComplexTestData();
      mockGet.mockResolvedValue({ data: mockComplexData });

      const { result } = renderHook(() => useRequest<ComplexTestData>('/test'));
      
      const response = await act(async () => {
        return await result.current.execute({
          method: 'GET',
        });
      });

      expect(response).toEqual(mockComplexData);
      expectTypeChecks(response);
    });

    it('应该正确处理联合类型', async () => {
      const testData = createTestData();
      const [successResponse, errorResponse] = createUnionResponses(testData);

      mockGet
        .mockResolvedValueOnce({ data: successResponse })
        .mockResolvedValueOnce({ data: errorResponse });

      const { result } = renderHook(() => useRequest<UnionResponseType>('/test'));
      
      const response1 = await act(async () => {
        return await result.current.execute({
          method: 'GET',
        });
      });

      if ('success' in response1 && response1.success) {
        expect(response1.data).toEqual(testData);
      }

      const response2 = await act(async () => {
        return await result.current.execute({
          method: 'GET',
        });
      });

      if ('success' in response2 && !response2.success) {
        expect(response2.error).toBe('Not found');
      }
    });
  });
});

// 测试工具函数
const setupRequestTest = (mockResponse?: TestResponse) => {
  const testData = createTestData();
  const response = mockResponse || createTestResponse(testData);
  mockGet.mockResolvedValue(response);
  const view = renderHook(() => useRequest<TestData>('/test'));
  return { 
    testData, 
    response, 
    result: view.result,
    rerender: view.rerender 
  };
};

const executeRequestWithCache = async (
  result: any, 
  options?: { 
    ttl?: number, 
    key?: string,
    method: string
  }
) => {
  await act(async () => {
    await result.current.execute({
      cache: {
        enable: true,
        ttl: options?.ttl || 5000,
        ...(options?.key && { key: options.key }),
      },
      method: options?.method || 'GET',
    });
  });
};

const expectErrorHandling = async (
  result: any,
  mockError: AxiosError
) => {
  await act(async () => {
    try {
      await result.current.execute({
        method: 'GET',
      });
    } catch (error) {
      expect(error).toBe(mockError);
    }
  });
  
  expect(result.current.loading).toBeFalsy();
  expect(result.current.error).toBe(mockError);
  expect(result.current.data).toBeNull();
};
