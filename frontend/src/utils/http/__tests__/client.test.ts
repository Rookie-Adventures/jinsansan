import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { HttpRequestConfig } from '../types';
import type { ApiResponse } from '@/types/api';

import request from '../../request';
import { http } from '../client';

// Mock request module
vi.mock('../../request', () => ({
  default: vi.fn(),
}));

describe('HttpClient', () => {
  const mockResponse: ApiResponse<{ message: string }> = {
    code: 200,
    message: 'success',
    data: { message: 'success' },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET 请求', () => {
    it('应该正确发送 GET 请求', async () => {
      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      const result = await http.get('/test');

      expect(request).toHaveBeenCalledWith({
        url: '/test',
        method: 'GET',
        headers: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该正确处理请求配置', async () => {
      const config: HttpRequestConfig = {
        headers: { 'X-Test': 'test' },
        params: { id: 1 },
      };

      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      await http.get('/test', config);

      expect(request).toHaveBeenCalledWith({
        ...config,
        url: '/test',
        method: 'GET',
        headers: { 'X-Test': 'test' },
      });
    });

    it('应该处理请求错误', async () => {
      const error = new Error('Network Error');
      vi.mocked(request).mockRejectedValueOnce(error);

      await expect(http.get('/test')).rejects.toThrow('Network Error');
    });
  });

  describe('POST 请求', () => {
    it('应该正确发送 POST 请求', async () => {
      const data = { name: 'test' };
      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      const result = await http.post('/test', data);

      expect(request).toHaveBeenCalledWith({
        url: '/test',
        method: 'POST',
        data,
        headers: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该正确处理请求配置', async () => {
      const data = { name: 'test' };
      const config: HttpRequestConfig = {
        headers: { 'Content-Type': 'application/json' },
      };

      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      await http.post('/test', data, config);

      expect(request).toHaveBeenCalledWith({
        ...config,
        url: '/test',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('PUT 请求', () => {
    it('应该正确发送 PUT 请求', async () => {
      const data = { name: 'updated' };
      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      const result = await http.put('/test/1', data);

      expect(request).toHaveBeenCalledWith({
        url: '/test/1',
        method: 'PUT',
        data,
        headers: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该正确处理请求配置', async () => {
      const data = { name: 'updated' };
      const config: HttpRequestConfig = {
        headers: { 'Content-Type': 'application/json' },
      };

      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      await http.put('/test/1', data, config);

      expect(request).toHaveBeenCalledWith({
        ...config,
        url: '/test/1',
        method: 'PUT',
        data,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('DELETE 请求', () => {
    it('应该正确发送 DELETE 请求', async () => {
      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      const result = await http.delete('/test/1');

      expect(request).toHaveBeenCalledWith({
        url: '/test/1',
        method: 'DELETE',
        headers: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该正确处理请求配置', async () => {
      const config: HttpRequestConfig = {
        headers: { 'X-Test': 'test' },
      };

      vi.mocked(request).mockResolvedValueOnce(mockResponse);

      await http.delete('/test/1', config);

      expect(request).toHaveBeenCalledWith({
        ...config,
        url: '/test/1',
        method: 'DELETE',
        headers: { 'X-Test': 'test' },
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const error = new Error('Network Error');
      vi.mocked(request).mockRejectedValueOnce(error);

      await expect(http.get('/test')).rejects.toThrow('Network Error');
    });

    it('应该处理服务器错误', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      vi.mocked(request).mockRejectedValueOnce(error);

      await expect(http.get('/test')).rejects.toThrow();
    });

    it('应该处理请求超时', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };
      vi.mocked(request).mockRejectedValueOnce(error);

      await expect(http.get('/test')).rejects.toThrow('timeout of 5000ms exceeded');
    });
  });
}); 