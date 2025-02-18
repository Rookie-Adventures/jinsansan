// Mock http client
vi.mock('@/utils/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { http } from '@/utils/http';
import type { HttpRequestConfig } from '@/utils/http/types';

import { useHttp } from '../useHttp';

describe('useHttp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET 请求', () => {
    it('应该正确发送 GET 请求', async () => {
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.get).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.get('/test');

      expect(http.get).toHaveBeenCalledWith('/test', undefined);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 GET 请求的配置参数', async () => {
      const mockConfig: HttpRequestConfig = {
        params: { id: 1 },
        headers: { 'X-Test': 'test' },
      };
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.get).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.get('/test', mockConfig);

      expect(http.get).toHaveBeenCalledWith('/test', mockConfig);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 GET 请求的错误', async () => {
      const mockError = new Error('Network error');
      vi.mocked(http.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => useHttp());
      await expect(result.current.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('POST 请求', () => {
    it('应该正确发送 POST 请求', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.post('/test', mockData);

      expect(http.post).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 POST 请求的配置参数', async () => {
      const mockData = { name: 'test' };
      const mockConfig: HttpRequestConfig = {
        headers: { 'X-Test': 'test' },
      };
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.post).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.post('/test', mockData, mockConfig);

      expect(http.post).toHaveBeenCalledWith('/test', mockData, mockConfig);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 POST 请求的错误', async () => {
      const mockError = new Error('Network error');
      vi.mocked(http.post).mockRejectedValue(mockError);

      const { result } = renderHook(() => useHttp());
      await expect(result.current.post('/test', {})).rejects.toThrow('Network error');
    });
  });

  describe('PUT 请求', () => {
    it('应该正确发送 PUT 请求', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.put).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.put('/test', mockData);

      expect(http.put).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 PUT 请求的配置参数', async () => {
      const mockData = { name: 'test' };
      const mockConfig: HttpRequestConfig = {
        headers: { 'X-Test': 'test' },
      };
      const mockResponse = { data: { id: 1, name: 'test' } };
      vi.mocked(http.put).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.put('/test', mockData, mockConfig);

      expect(http.put).toHaveBeenCalledWith('/test', mockData, mockConfig);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 PUT 请求的错误', async () => {
      const mockError = new Error('Network error');
      vi.mocked(http.put).mockRejectedValue(mockError);

      const { result } = renderHook(() => useHttp());
      await expect(result.current.put('/test', {})).rejects.toThrow('Network error');
    });
  });

  describe('DELETE 请求', () => {
    it('应该正确发送 DELETE 请求', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(http.delete).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.delete('/test');

      expect(http.delete).toHaveBeenCalledWith('/test', undefined);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 DELETE 请求的配置参数', async () => {
      const mockConfig: HttpRequestConfig = {
        headers: { 'X-Test': 'test' },
      };
      const mockResponse = { data: { success: true } };
      vi.mocked(http.delete).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.delete('/test', mockConfig);

      expect(http.delete).toHaveBeenCalledWith('/test', mockConfig);
      expect(response).toEqual(mockResponse);
    });

    it('应该正确处理 DELETE 请求的错误', async () => {
      const mockError = new Error('Network error');
      vi.mocked(http.delete).mockRejectedValue(mockError);

      const { result } = renderHook(() => useHttp());
      await expect(result.current.delete('/test')).rejects.toThrow('Network error');
    });
  });

  describe('类型安全', () => {
    it('应该正确处理泛型类型', async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const mockResponse: TestData = { id: 1, name: 'test' };
      vi.mocked(http.get).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.get<TestData>('/test');

      expect(response).toEqual(mockResponse);
    });
  });

  describe('Hook 持久性', () => {
    it('重新渲染时应该返回相同的方法引用', () => {
      const { result, rerender } = renderHook(() => useHttp());

      const firstRender = {
        get: result.current.get,
        post: result.current.post,
        put: result.current.put,
        delete: result.current.delete,
      };

      rerender();

      expect(result.current.get).toBe(firstRender.get);
      expect(result.current.post).toBe(firstRender.post);
      expect(result.current.put).toBe(firstRender.put);
      expect(result.current.delete).toBe(firstRender.delete);
    });
  });
});
