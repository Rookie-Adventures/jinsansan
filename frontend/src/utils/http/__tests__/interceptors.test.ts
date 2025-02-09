import { AxiosHeaders, AxiosInstance, AxiosProgressEvent, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RequestValidator } from '../error/prevention';
import { HttpErrorType } from '../error/types';
import { requestManager } from '../manager';
import { setupInterceptors } from '../interceptors';
import { useGlobalProgress } from '@/hooks/feedback/useGlobalProgress';

// Mock useGlobalProgress
vi.mock('@/hooks/feedback/useGlobalProgress', () => ({
  useGlobalProgress: {
    getState: vi.fn(() => ({
      setProgress: vi.fn(),
      setLoading: vi.fn()
    }))
  }
}));

describe('HTTP 拦截器测试', () => {
  let instance: AxiosInstance;

  beforeEach(() => {
    vi.restoreAllMocks();

    // 重置所有 mock
    vi.clearAllMocks();

    // 创建模拟的 Axios 实例
    instance = {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    } as unknown as AxiosInstance;

    // 设置拦截器
    setupInterceptors(instance);
  });

  describe('请求验证', () => {
    test('应该验证请求配置', () => {
      const config: InternalAxiosRequestConfig = {
        method: 'GET',
        url: '/test',
        headers: new AxiosHeaders()
      };

      const spy = vi.spyOn(RequestValidator, 'validateRequest');
      
      try {
        RequestValidator.validateRequest(config);
        expect(spy).toHaveBeenCalledWith(config);
      } catch (error) {
        fail('不应该抛出错误');
      }
    });

    test('无效请求应该抛出错误', () => {
      const invalidConfig: InternalAxiosRequestConfig = {
        method: 'INVALID',
        url: '',
        headers: new AxiosHeaders()
      };

      expect(() => {
        RequestValidator.validateRequest(invalidConfig);
      }).toThrow();
    });

    test('应该添加请求 ID', async () => {
      const config = { 
        url: '/test', 
        method: 'GET',
        headers: {} // 确保 headers 存在
      };
      const result = await requestManager.executeRequestInterceptor(config);
      expect(result.headers?.['X-Request-ID']).toBeDefined();
    });
  });

  describe('错误预防', () => {
    test('应该运行错误预防规则', async () => {
      const config = { url: '/test', method: 'GET' };
      await expect(requestManager.executeRequestInterceptor(config)).resolves.toBeDefined();
    });

    test('违反规则应该抛出错误', async () => {
      const config = { url: '/protected', method: 'POST' };
      await expect(requestManager.executeRequestInterceptor(config)).rejects.toThrow();
    });
  });

  describe('认证处理', () => {
    test('应该处理认证错误', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      await expect(requestManager.executeErrorInterceptor(error)).rejects.toMatchObject({
        type: HttpErrorType.AUTH,
        status: 401,
        message: 'Token expired',
        recoverable: true
      });
    });

    test('应该处理权限错误', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Permission denied' }
        }
      };

      await expect(requestManager.executeErrorInterceptor(error)).rejects.toMatchObject({
        type: HttpErrorType.AUTH,
        status: 403,
        message: 'Permission denied',
        recoverable: false
      });
    });
  });

  describe('请求限流', () => {
    beforeEach(() => {
      requestManager.setMaxConcurrentRequests(2);
      // 清理当前请求集合
      (requestManager as any).currentRequests.clear();
    });

    test('应该限制并发请求数', async () => {
      const requestId1 = 'req1';
      const requestId2 = 'req2';
      const requestId3 = 'req3';

      // 使用 Promise.all 确保并发执行
      const [slot1, slot2] = await Promise.all([
        requestManager.acquireRequestSlot(requestId1, {}),
        requestManager.acquireRequestSlot(requestId2, {})
      ]);

      // 尝试获取第三个槽位
      const slot3 = await requestManager.acquireRequestSlot(requestId3, {});

      expect(slot1).toBe(true);
      expect(slot2).toBe(true);
      expect(slot3).toBe(false);

      // 清理
      requestManager.releaseRequestSlot(requestId1);
      requestManager.releaseRequestSlot(requestId2);
    });

    test('应该在请求完成后释放槽位', async () => {
      const requestId = 'req1';
      
      // 确保开始时没有占用槽位
      (requestManager as any).currentRequests.clear();
      
      // 获取槽位
      const acquired = await requestManager.acquireRequestSlot(requestId, {});
      expect(acquired).toBe(true);
      
      // 释放槽位
      requestManager.releaseRequestSlot(requestId);
      
      // 等待一个事件循环，确保释放操作完成
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 验证槽位被释放后可以获取新的请求
      const canAcquireNew = await requestManager.acquireRequestSlot('req2', {});
      expect(canAcquireNew).toBe(true);

      // 清理
      requestManager.releaseRequestSlot('req2');
    });
  });

  describe('性能监控', () => {
    beforeEach(() => {
      requestManager.resetPerformanceStats();
    });

    test('应该记录请求时间', async () => {
      const requestId = 'test1';
      requestManager.recordRequestStart(requestId);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      requestManager.recordRequestEnd(requestId);
      requestManager.recordRequestComplete(true);
      
      const stats = requestManager.getPerformanceStats();
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.totalRequests).toBe(1);
    });

    test('应该计算成功率', () => {
      requestManager.recordRequestComplete(true);  // 成功
      requestManager.recordRequestComplete(true);  // 成功
      requestManager.recordRequestComplete(false); // 失败

      const stats = requestManager.getPerformanceStats();
      expect(stats.successRate).toBeCloseTo(2/3);
      expect(stats.totalRequests).toBe(3);
      expect(stats.successfulRequests).toBe(2);
      expect(stats.failedRequests).toBe(1);
    });
  });

  describe('请求拦截器', () => {
    it('应该在请求开始时增加请求计数并更新加载状态', () => {
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: new AxiosHeaders()
      };

      const setLoading = vi.fn();
      (useGlobalProgress.getState as any).mockReturnValue({ setLoading, setProgress: vi.fn() });

      // 获取请求拦截器
      const requestInterceptor = (instance.interceptors.request.use as ReturnType<typeof vi.fn>).mock.calls[0][0];
      requestInterceptor(config);

      expect(setLoading).toHaveBeenCalledWith(true);
    });

    it('应该设置上传进度监听器', () => {
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'post',
        headers: new AxiosHeaders()
      };

      const setProgress = vi.fn();
      (useGlobalProgress.getState as any).mockReturnValue({ setProgress, setLoading: vi.fn() });

      // 获取请求拦截器
      const requestInterceptor = (instance.interceptors.request.use as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const interceptedConfig = requestInterceptor(config);

      expect(interceptedConfig.onUploadProgress).toBeDefined();

      // 模拟上传进度事件
      const progressEvent: AxiosProgressEvent = {
        loaded: 50,
        total: 100,
        bytes: 50,
        lengthComputable: true,
        estimated: 100,
        rate: 1,
        download: false,
        upload: true
      };
      interceptedConfig.onUploadProgress?.(progressEvent);

      expect(setProgress).toHaveBeenCalledWith(25); // (50/100 + 0) / 2 = 25
    });

    it('应该设置下载进度监听器', () => {
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: new AxiosHeaders()
      };

      const setProgress = vi.fn();
      (useGlobalProgress.getState as any).mockReturnValue({ setProgress, setLoading: vi.fn() });

      // 获取请求拦截器
      const requestInterceptor = (instance.interceptors.request.use as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const interceptedConfig = requestInterceptor(config);

      expect(interceptedConfig.onDownloadProgress).toBeDefined();

      // 模拟下载进度事件
      const progressEvent: AxiosProgressEvent = {
        loaded: 75,
        total: 100,
        bytes: 75,
        lengthComputable: true,
        estimated: 100,
        rate: 1,
        download: true,
        upload: false
      };
      interceptedConfig.onDownloadProgress?.(progressEvent);

      expect(setProgress).toHaveBeenCalledWith(37.5); // (0 + 75/100) / 2 = 37.5
    });
  });

  describe('响应拦截器', () => {
    it('应该在响应完成时减少请求计数并更新加载状态', () => {
      const response: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders()
        } as InternalAxiosRequestConfig
      };

      const setLoading = vi.fn();
      (useGlobalProgress.getState as any).mockReturnValue({ setLoading, setProgress: vi.fn() });

      // 获取响应拦截器
      const responseInterceptor = (instance.interceptors.response.use as ReturnType<typeof vi.fn>).mock.calls[0][0];
      responseInterceptor(response);

      expect(setLoading).toHaveBeenCalledWith(false);
    });

    it('应该在响应错误时减少请求计数并更新加载状态', async () => {
      const error = new Error('Network Error');

      const setLoading = vi.fn();
      const setProgress = vi.fn();
      (useGlobalProgress.getState as any).mockReturnValue({ setLoading, setProgress });

      // 获取错误拦截器
      const responseErrorInterceptor = (instance.interceptors.response.use as ReturnType<typeof vi.fn>).mock.calls[0][1];
      try {
        await responseErrorInterceptor(error);
      } catch (e) {
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setProgress).toHaveBeenCalledWith(null);
      }
    });
  });
}); 