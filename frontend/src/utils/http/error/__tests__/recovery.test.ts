import { describe, it, expect, vi, beforeEach } from 'vitest';

// 设置 mock，使用模块级别的 mock 定义
vi.mock('@/infrastructure/logging/Logger', () => {
  const mockLogger = {
    warn: vi.fn(),
    error: vi.fn(),
  };
  return {
    Logger: {
      getInstance: vi.fn(() => mockLogger)
    }
  };
});

import { Logger } from '@/infrastructure/logging/Logger';

import { errorRecoveryManager } from '../recovery';
import { HttpError, HttpErrorType } from '../types';

describe('ErrorRecoveryManager', () => {
  let mockLogger: ReturnType<typeof Logger.getInstance>;

  beforeEach(() => {
    // 获取当前的 mock 实例
    mockLogger = vi.mocked(Logger.getInstance());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('网络错误恢复', () => {
    it('应该处理超时错误并重试', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'TIMEOUT',
        message: 'Request timeout',
        status: 408,
        data: {
          retryCount: 0,
          url: '/api/test',
        },
      });

      const recoveryPromise = errorRecoveryManager.attemptRecovery(error);
      await vi.runAllTimersAsync();
      const result = await recoveryPromise;

      expect(result).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Network recovery attempt: Request timeout',
        expect.any(Object)
      );
    });

    it('应该在达到最大重试次数后停止重试', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'TIMEOUT',
        message: 'Request timeout',
        status: 408,
        data: {
          retryCount: 3, // 已达到最大重试次数
          url: '/api/test',
        },
      });

      const recoveryPromise = errorRecoveryManager.attemptRecovery(error);
      await vi.runAllTimersAsync();
      const result = await recoveryPromise;

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Network recovery attempt: Request timeout',
        expect.any(Object)
      );
    });

    it('应该处理网络连接错误', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: 'Network error',
        status: 0,
        data: {
          retryCount: 0,
          url: '/api/test',
        },
      });

      // 模拟在线状态
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true,
      });

      const result = await errorRecoveryManager.attemptRecovery(error);

      expect(result).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Network recovery attempt: Network error',
        expect.any(Object)
      );
    });

    it('应该在离线状态下不重试网络错误', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: 'Network error',
        status: 0,
        data: {
          retryCount: 0,
          url: '/api/test',
        },
      });

      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false,
      });

      const result = await errorRecoveryManager.attemptRecovery(error);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Network recovery attempt: Network error',
        expect.any(Object)
      );
    });
  });

  describe('认证错误恢复', () => {
    it('应该处理 Token 过期错误', async () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
        status: 401,
        data: {
          url: '/api/test',
        },
      });

      const result = await errorRecoveryManager.attemptRecovery(error);

      expect(result).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Auth recovery attempt: Token expired',
        expect.any(Object)
      );
    });

    it('应该处理无效 Token 错误', async () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
        status: 401,
        data: {
          url: '/api/test',
        },
      });

      const result = await errorRecoveryManager.attemptRecovery(error);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Auth recovery attempt: Invalid token',
        expect.any(Object)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid token detected',
        expect.any(Object)
      );
    });
  });

  describe('错误恢复过程中的错误处理', () => {
    it('应该处理恢复过程中的错误并返回 false', async () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
        status: 401,
        data: {
          url: '/api/test',
        },
      });

      // 模拟恢复过程中的错误
      vi.spyOn(errorRecoveryManager as any, 'handleAuthError').mockImplementationOnce(() => {
        throw new Error('Recovery process failed');
      });

      const result = await errorRecoveryManager.attemptRecovery(error);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Recovery attempt failed',
        expect.any(Object)
      );
    });
  });

  describe('重试延迟', () => {
    it('应该按照配置的延迟时间进行重试', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'TIMEOUT',
        message: 'Request timeout',
        status: 408,
        data: {
          retryCount: 0,
          url: '/api/test',
        },
      });

      const recoveryPromise = errorRecoveryManager.attemptRecovery(error);
      
      // 第一次重试应该等待 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      
      const result = await recoveryPromise;
      expect(result).toBe(true);
    });

    it('应该使用递增的延迟时间', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        code: 'TIMEOUT',
        message: 'Request timeout',
        status: 408,
        data: {
          retryCount: 1, // 第二次重试
          url: '/api/test',
        },
      });

      const recoveryPromise = errorRecoveryManager.attemptRecovery(error);
      
      // 第二次重试应该等待 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      
      const result = await recoveryPromise;
      expect(result).toBe(true);
    });
  });
}); 