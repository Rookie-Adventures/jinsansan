import { renderHook, act, waitFor } from '@testing-library/react';
import { AxiosHeaders } from 'axios';
import { vi } from 'vitest';

import type { AxiosError } from 'axios';

import { useCache } from '@/hooks/http/useCache';
import { useHttp } from '@/hooks/http/useHttp';

import { useRequest } from '../useRequest';

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
      generateCacheKey: vi.fn(),
      clearCache: vi.fn(),
    });
  });

  describe('基础功能', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useRequest<any>('/test'));

      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
      expect(typeof result.current.execute).toBe('function');
    });

    it('应该正确处理成功的请求', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<typeof mockResponse.data>('/test'));

      expect(result.current.loading).toBeFalsy();

      let response;
      await act(async () => {
        response = await result.current.execute();
      });

      expect(response).toEqual(mockResponse.data);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockResponse.data);
      expect(mockGet).toHaveBeenCalledWith('/test', expect.any(Object));
    });

    it('应该正确处理失败的请求', async () => {
      const headers = new AxiosHeaders();
      const mockError: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed',
        isAxiosError: true,
        toJSON: () => ({}),
        config: {
          headers,
        },
        response: {
          data: { message: 'Internal server error' },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {
            headers,
          },
        },
      };
      mockGet.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRequest<any>('/test'));

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
  });

  describe('缓存功能', () => {
    it('启用缓存时应该优先返回缓存数据', async () => {
      const cachedData = { id: 1, name: 'cached' };
      mockGetCacheData.mockReturnValue(cachedData);

      const { result } = renderHook(() => useRequest<typeof cachedData>('/test'));

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
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };
      mockGetCacheData.mockReturnValue(null);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<typeof mockResponse.data>('/test'));

      await act(async () => {
        await result.current.execute({
          cache: {
            enable: true,
            ttl: 5000,
          },
        });
      });

      expect(mockSetCacheData).toHaveBeenCalledWith('/test', mockResponse.data, 5000);
      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('应该使用自定义缓存键', async () => {
      const customCacheKey = 'custom-key';
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };
      mockGetCacheData.mockReturnValue(null);
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<typeof mockResponse.data>('/test'));

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
      expect(mockSetCacheData).toHaveBeenCalledWith(customCacheKey, mockResponse.data, 5000);
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
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useRequest<typeof mockResponse.data>('/test', defaultOptions)
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
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRequest<typeof mockResponse.data>('/test'));

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
  });

  describe('状态管理', () => {
    it('应该在请求期间设置正确的 loading 状态', async () => {
      const mockResponse = {
        code: 200,
        data: { id: 1, name: 'test' },
        message: 'success',
      };

      let resolveRequest: (value: any) => void;
      mockGet.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveRequest = resolve;
          })
      );

      const { result } = renderHook(() => useRequest<typeof mockResponse.data>('/test'));

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
      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('应该在错误时保持正确的状态', async () => {
      const mockError = new Error('Request failed');
      mockGet.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRequest<any>('/test'));

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
  });
});
