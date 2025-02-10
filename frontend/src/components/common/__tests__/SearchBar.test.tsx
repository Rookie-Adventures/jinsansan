import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SearchBar } from '../SearchBar';
import type { SearchResult } from '../../../infrastructure/search/SearchService';

// 测试配置
const TEST_TIMEOUT = 1000;

// 测试类型定义
interface TestItem {
  id: number;
  name: string;
}

// Mock 搜索服务
const mockSearch = vi.fn();
vi.mock('../../../infrastructure/search/SearchService', () => ({
  SearchServiceImpl: vi.fn().mockImplementation(() => ({
    search: mockSearch,
  })),
}));

// Mock Logger
vi.mock('../../../infrastructure/logging/Logger', () => ({
  Logger: {
    getInstance: () => ({
      error: vi.fn(),
    }),
  },
}));

// Mock lodash debounce to execute immediately in tests
vi.mock('lodash/debounce', () => ({
  default: (fn: Function) => fn,
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染搜索框', () => {
      render(<SearchBar<TestItem> onSearchResult={() => {}} />);
      const searchInput = screen.getByPlaceholderText('搜索...');

      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('应该使用自定义占位符', () => {
      const placeholder = '请输入关键词';
      render(<SearchBar<TestItem> onSearchResult={() => {}} placeholder={placeholder} />);

      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });
  });

  describe('搜索功能', () => {
    it('应该在输入时触发搜索', async () => {
      const mockResult: SearchResult<TestItem> = {
        items: [{ id: 1, name: 'test' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockSearch.mockResolvedValueOnce(mockResult);

      const onSearchResult = vi.fn();
      render(<SearchBar<TestItem> onSearchResult={onSearchResult} />);

      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(
        () => {
          expect(mockSearch).toHaveBeenCalledWith({
            keyword: 'test',
            page: 1,
            pageSize: 10,
          });
          expect(onSearchResult).toHaveBeenCalledWith(mockResult.items);
        },
        { timeout: TEST_TIMEOUT }
      );
    });

    it('不应该搜索空字符串', async () => {
      const onSearchResult = vi.fn();
      render(<SearchBar<TestItem> onSearchResult={onSearchResult} />);

      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      await waitFor(
        () => {
          expect(mockSearch).not.toHaveBeenCalled();
          expect(onSearchResult).not.toHaveBeenCalled();
        },
        { timeout: TEST_TIMEOUT }
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理搜索错误', async () => {
      const mockError = new Error('Search failed');
      mockSearch.mockRejectedValueOnce(mockError);

      const onError = vi.fn();
      render(<SearchBar<TestItem> onSearchResult={() => {}} onError={onError} />);

      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(
        () => {
          expect(onError).toHaveBeenCalledWith(expect.any(Error));
          expect(onError.mock.calls[0][0].message).toBe('Search failed');
        },
        { timeout: TEST_TIMEOUT }
      );
    });
  });
});
