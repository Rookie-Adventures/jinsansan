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

import type { HttpRequestConfig } from '@/utils/http/types';

import { 
  createMockResponse, 
  testHttpMethod, 
  testHttpMethodError,
  createMockAbortController 
} from '@/test/utils/httpTestHelpers';
import { http } from '@/utils/http';

import { useHttp } from '../useHttp';

// 共享的测试数据
interface TestData {
  id: number;
  name: string;
}

const mockTestData: TestData = { id: 1, name: 'test' };
const mockConfig: HttpRequestConfig = {
  headers: { 'X-Test': 'test' },
  params: { id: 1 },
};

describe('useHttp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.each([
    ['GET', 'get' as const],
    ['POST', 'post' as const],
    ['PUT', 'put' as const],
    ['DELETE', 'delete' as const],
  ])('%s 请求', (name, method) => {
    it(`应该正确发送 ${name} 请求`, async () => {
      await testHttpMethod({
        method,
        mockData: method === 'delete' ? { success: true } : mockTestData,
        requestData: ['post', 'put'].includes(method) ? mockTestData : undefined,
        hook: useHttp
      });
    });

    it(`应该正确处理 ${name} 请求的配置参数`, async () => {
      await testHttpMethod({
        method,
        mockData: method === 'delete' ? { success: true } : mockTestData,
        requestData: ['post', 'put'].includes(method) ? mockTestData : undefined,
        config: mockConfig,
        hook: useHttp
      });
    });

    it(`应该正确处理 ${name} 请求的错误`, async () => {
      await testHttpMethodError(
        method, 
        useHttp,
        ['post', 'put'].includes(method) ? {} : undefined
      );
    });
  });

  it('应该支持请求取消', async () => {
    const mockAbortController = createMockAbortController();
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';

    vi.mocked(http.get).mockImplementation((_url, config) => {
      const signal = config?.signal as AbortSignal | undefined;
      if (signal?.aborted) {
        return Promise.reject(abortError);
      }

      return new Promise((_resolve, reject) => {
        const handleAbort = () => {
          if (signal) {
            signal.removeEventListener('abort', handleAbort);
          }
          reject(abortError);
        };

        if (signal) {
          signal.addEventListener('abort', handleAbort);
        }
      });
    });

    const { result } = renderHook(() => useHttp());
    const promise = result.current.get('/test', { signal: mockAbortController.signal });

    // 立即取消请求
    mockAbortController.abort();

    await expect(promise).rejects.toThrow('AbortError');
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

      const mockResponse = createMockResponse(mockComplexData);
      vi.mocked(http.get).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useHttp());
      const response = await result.current.get<typeof mockResponse>('/test');

      expect(response).toEqual(mockResponse);
      // 类型检查 - 这些断言在运行时会被执行，但在编译时也会进行类型检查
      expect(typeof response.data.id).toBe('number');
      expect(typeof response.data.name).toBe('string');
      expect(Array.isArray(response.data.tags)).toBe(true);
      expect(response.data.metadata).toHaveProperty('createdAt');
      expect(response.data.metadata).toHaveProperty('updatedAt');
    });

    it('应该正确处理联合类型', async () => {
      type ResponseType = { success: true; data: TestData } | { success: false; error: string };

      const successResponse: ResponseType = { success: true, data: mockTestData };
      const errorResponse: ResponseType = { success: false, error: 'Not found' };

      vi.mocked(http.get)
        .mockResolvedValueOnce(createMockResponse(successResponse))
        .mockResolvedValueOnce(createMockResponse(errorResponse));

      const { result } = renderHook(() => useHttp());
      
      const response1 = await result.current.get<{ data: ResponseType }>('/test');
      expect(response1.data.success).toBe(true);
      if (response1.data.success) {
        expect(response1.data.data).toEqual(mockTestData);
      }

      const response2 = await result.current.get<{ data: ResponseType }>('/test');
      expect(response2.data.success).toBe(false);
      if (!response2.data.success) {
        expect(response2.data.error).toBe('Not found');
      }
    });
  });
});
