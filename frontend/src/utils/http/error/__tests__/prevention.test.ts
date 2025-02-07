import { errorPreventionManager, RequestValidator, cacheManager } from '../prevention';
import { HttpErrorType } from '../types';
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';

describe('ErrorPreventionManager', () => {
  beforeAll(() => {
    // 创建完整的 localStorage 模拟
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  beforeEach(() => {
    // 重置实例状态
    (errorPreventionManager as any).rules = [];
    
    // 重置 localStorage mock 并设置默认值
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue('test-token');
    
    // 设置在线状态
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // 添加默认规则
    errorPreventionManager.addRule({
      check: () => navigator.onLine,
      errorType: HttpErrorType.NETWORK,
      message: '当前处于离线状态，请检查网络连接'
    });
    errorPreventionManager.addRule({
      check: () => {
        const token = window.localStorage.getItem('token');
        return !!token;
      },
      errorType: HttpErrorType.AUTH,
      message: '未登录或登录已过期'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('规则管理', () => {
    test('应该能添加新规则', () => {
      const newRule = {
        check: () => true,
        errorType: HttpErrorType.VALIDATION,
        message: '测试规则'
      };
      errorPreventionManager.addRule(newRule);
      expect((errorPreventionManager as any).rules).toContainEqual(newRule);
    });

    test('应该正确执行所有规则', async () => {
      await expect(errorPreventionManager.checkRules()).resolves.not.toThrow();
    });

    test('当规则检查失败时应该抛出错误', async () => {
      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      // 模拟 localStorage.getItem 返回 null
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);

      await expect(errorPreventionManager.checkRules()).rejects.toThrow('当前处于离线状态');
    });
  });
});

describe('RequestValidator', () => {
  describe('请求验证', () => {
    test('应该验证请求URL', () => {
      expect(() => {
        RequestValidator.validateRequest({} as any);
      }).toThrow('请求 URL 不能为空');
    });

    test('应该验证请求方法', () => {
      expect(() => {
        RequestValidator.validateRequest({ url: 'test' } as any);
      }).toThrow('请求方法不能为空');
    });

    test('应该验证请求数据大小', () => {
      const largeData = 'a'.repeat(6 * 1024 * 1024); // 6MB
      expect(() => {
        RequestValidator.validateRequest({
          url: 'test',
          method: 'POST',
          data: largeData
        });
      }).toThrow('请求数据过大');
    });

    test('应该验证敏感字段', () => {
      expect(() => {
        RequestValidator.validateRequest({
          url: 'test',
          method: 'POST',
          data: {
            password: 'plaintext'
          }
        });
      }).toThrow('敏感字段 password 必须加密后传输');
    });

    test('应该允许已哈希的敏感字段', () => {
      expect(() => {
        RequestValidator.validateRequest({
          url: 'test',
          method: 'POST',
          data: {
            password: 'a'.repeat(32)
          }
        });
      }).not.toThrow();
    });
  });
});

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  describe('缓存操作', () => {
    test('应该能设置和获取缓存', () => {
      const key = 'test-key';
      const data = { test: 'data' };
      
      cacheManager.set(key, data);
      expect(cacheManager.get(key)).toEqual(data);
    });

    test('应该返回 null 当缓存不存在', () => {
      expect(cacheManager.get('non-existent')).toBeNull();
    });

    test('应该在过期后返回 null', async () => {
      const key = 'test-key';
      const data = { test: 'data' };
      
      // 设置一个较短的过期时间用于测试
      (cacheManager as any).maxAge = 100; // 100ms
      
      cacheManager.set(key, data);
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get(key)).toBeNull();
    });

    test('应该能生成正确的缓存键', () => {
      const config = {
        method: 'GET',
        url: '/api/test',
        params: { id: 1 }
      };
      
      const key = cacheManager.getCacheKey(config);
      expect(key).toBe('GET-/api/test-{"id":1}');
    });

    test('应该能清除所有缓存', () => {
      cacheManager.set('key1', 'data1');
      cacheManager.set('key2', 'data2');
      
      cacheManager.clear();
      
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
    });
  });
}); 