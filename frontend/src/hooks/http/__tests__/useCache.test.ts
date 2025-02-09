import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCache } from '../useCache';
import { requestManager } from '@/utils/http';

// Mock requestManager
vi.mock('@/utils/http', () => ({
  requestManager: {
    getCacheData: vi.fn(),
    setCacheData: vi.fn(),
    generateCacheKey: vi.fn(),
    cache: {
      delete: vi.fn(),
      clear: vi.fn()
    }
  }
}));

describe('useCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('获取缓存数据', () => {
    it('应该正确获取缓存数据', () => {
      const mockData = { id: 1, name: 'test' };
      vi.mocked(requestManager.getCacheData).mockReturnValue(mockData);

      const { result } = renderHook(() => useCache());
      const data = result.current.getCacheData('test-key');

      expect(requestManager.getCacheData).toHaveBeenCalledWith('test-key');
      expect(data).toEqual(mockData);
    });

    it('缓存不存在时应该返回 null', () => {
      vi.mocked(requestManager.getCacheData).mockReturnValue(null);

      const { result } = renderHook(() => useCache());
      const data = result.current.getCacheData('non-existent-key');

      expect(requestManager.getCacheData).toHaveBeenCalledWith('non-existent-key');
      expect(data).toBeNull();
    });
  });

  describe('设置缓存数据', () => {
    it('应该使用默认 TTL 设置缓存数据', () => {
      const mockData = { id: 1, name: 'test' };
      const { result } = renderHook(() => useCache());

      act(() => {
        result.current.setCacheData('test-key', mockData);
      });

      expect(requestManager.setCacheData).toHaveBeenCalledWith(
        'test-key',
        mockData,
        5 * 60 * 1000 // 默认 5 分钟
      );
    });

    it('应该使用自定义 TTL 设置缓存数据', () => {
      const mockData = { id: 1, name: 'test' };
      const customTTL = 10000; // 10 秒
      const { result } = renderHook(() => useCache());

      act(() => {
        result.current.setCacheData('test-key', mockData, customTTL);
      });

      expect(requestManager.setCacheData).toHaveBeenCalledWith(
        'test-key',
        mockData,
        customTTL
      );
    });
  });

  describe('生成缓存键', () => {
    it('应该正确生成缓存键', () => {
      const mockConfig = {
        method: 'GET',
        url: '/test',
        params: { id: 1 }
      };
      const mockCacheKey = 'GET-/test-{"id":1}-undefined';
      vi.mocked(requestManager.generateCacheKey).mockReturnValue(mockCacheKey);

      const { result } = renderHook(() => useCache());
      const cacheKey = result.current.generateCacheKey(mockConfig);

      expect(cacheKey).toBe(mockCacheKey);
      expect(requestManager.generateCacheKey).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('清除缓存', () => {
    it('应该清除指定键的缓存', () => {
      const { result } = renderHook(() => useCache());

      act(() => {
        result.current.clearCache('test-key');
      });

      expect(requestManager.cache.delete).toHaveBeenCalledWith('test-key');
      expect(requestManager.cache.clear).not.toHaveBeenCalled();
    });

    it('不传键时应该清除所有缓存', () => {
      const { result } = renderHook(() => useCache());

      act(() => {
        result.current.clearCache();
      });

      expect(requestManager.cache.clear).toHaveBeenCalled();
      expect(requestManager.cache.delete).not.toHaveBeenCalled();
    });
  });

  describe('缓存持久性', () => {
    it('hook 重新渲染时应该保持缓存数据', () => {
      const mockData = { id: 1, name: 'test' };
      vi.mocked(requestManager.getCacheData).mockReturnValue(mockData);

      const { result, rerender } = renderHook(() => useCache());
      
      // 首次获取缓存
      const data1 = result.current.getCacheData('test-key');
      expect(data1).toEqual(mockData);

      // 重新渲染
      rerender();

      // 再次获取缓存
      const data2 = result.current.getCacheData('test-key');
      expect(data2).toEqual(mockData);

      // getCacheData 应该只被调用两次
      expect(requestManager.getCacheData).toHaveBeenCalledTimes(2);
    });
  });
}); 