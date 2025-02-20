import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { BaseResponse } from '../../http/HttpClient';
import type { SearchParams, SearchResult } from '../SearchService';

import { http } from '../../http/HttpClient';
import { SearchServiceImpl } from '../SearchService';

// Mock HttpClient
vi.mock('../../http/HttpClient', () => ({
  http: {
    get: vi.fn(),
  },
}));

describe('SearchService', () => {
  let searchService: SearchServiceImpl;
  const mockHttpGet = vi.mocked(http.get);

  beforeEach(() => {
    searchService = new SearchServiceImpl();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('基础搜索功能', () => {
    it('应该使用正确的参数调用基础搜索 API', async () => {
      // 准备测试数据
      const searchParams: SearchParams = {
        keyword: 'test',
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const mockResult: SearchResult<unknown> = {
        items: [{ id: 1, name: 'test' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      // Mock API 响应
      mockHttpGet.mockResolvedValueOnce({
        code: 200,
        message: 'success',
        data: mockResult,
      } as BaseResponse<SearchResult<unknown>>);

      // 执行搜索
      const result = await searchService.search(searchParams);

      // 验证 API 调用
      expect(mockHttpGet).toHaveBeenCalledWith('/api/search', { params: searchParams });
      expect(mockHttpGet).toHaveBeenCalledTimes(1);

      // 验证返回结果
      expect(result).toEqual(mockResult);
    });

    it('应该正确处理空的搜索参数', async () => {
      const searchParams: SearchParams = {
        keyword: '',
      };

      const mockResult: SearchResult<unknown> = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };

      mockHttpGet.mockResolvedValueOnce({
        code: 200,
        message: 'success',
        data: mockResult,
      } as BaseResponse<SearchResult<unknown>>);

      const result = await searchService.search(searchParams);

      expect(mockHttpGet).toHaveBeenCalledWith('/api/search', { params: searchParams });
      expect(result).toEqual(mockResult);
    });

    it('应该在 API 调用失败时抛出错误', async () => {
      const searchParams: SearchParams = {
        keyword: 'test',
      };

      const mockError = new Error('API Error');
      mockHttpGet.mockRejectedValueOnce(mockError);

      await expect(searchService.search(searchParams)).rejects.toThrow('API Error');
    });
  });

  describe('高级搜索功能', () => {
    it('应该使用正确的参数调用高级搜索 API', async () => {
      // 准备测试数据
      const searchParams: SearchParams = {
        keyword: 'test',
        filters: {
          category: { value: 'books', operator: 'eq' },
          price: { value: 100, operator: 'lte' },
        },
        page: 1,
        pageSize: 10,
      };

      const mockResult: SearchResult<unknown> = {
        items: [{ id: 1, name: 'test book', price: 50 }],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      mockHttpGet.mockResolvedValueOnce({
        code: 200,
        message: 'success',
        data: mockResult,
      } as BaseResponse<SearchResult<unknown>>);

      const result = await searchService.advancedSearch(searchParams);

      expect(mockHttpGet).toHaveBeenCalledWith('/api/search/advanced', { params: searchParams });
      expect(result).toEqual(mockResult);
    });

    it('应该正确处理复杂的过滤条件', async () => {
      const searchParams: SearchParams = {
        keyword: 'test',
        filters: {
          name: { value: 'test', operator: 'contains' },
          date: { value: '2024-01-01', operator: 'gte' },
          status: { value: true, operator: 'eq' },
        },
      };

      const mockResult: SearchResult<unknown> = {
        items: [{ id: 1, name: 'test item', date: '2024-01-02', status: true }],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      mockHttpGet.mockResolvedValueOnce({
        code: 200,
        message: 'success',
        data: mockResult,
      } as BaseResponse<SearchResult<unknown>>);

      const result = await searchService.advancedSearch(searchParams);

      expect(mockHttpGet).toHaveBeenCalledWith('/api/search/advanced', { params: searchParams });
      expect(result).toEqual(mockResult);
    });

    it('应该在高级搜索 API 调用失败时抛出错误', async () => {
      const searchParams: SearchParams = {
        keyword: 'test',
        filters: {
          category: { value: 'invalid', operator: 'eq' },
        },
      };

      const mockError = new Error('Invalid filter');
      mockHttpGet.mockRejectedValueOnce(mockError);

      await expect(searchService.advancedSearch(searchParams)).rejects.toThrow('Invalid filter');
    });
  });
}); 