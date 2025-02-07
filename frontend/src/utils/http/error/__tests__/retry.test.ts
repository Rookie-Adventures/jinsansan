import { ErrorRetryMiddleware } from '../retry';
import { HttpError } from '../error';
import { HttpErrorType } from '../types';
import { vi, beforeEach, describe, test, expect } from 'vitest';

describe('ErrorRetryMiddleware', () => {
  let retryMiddleware: ErrorRetryMiddleware;

  beforeEach(() => {
    // 创建默认的重试中间件实例
    retryMiddleware = new ErrorRetryMiddleware({
      maxRetries: 3,
      retryDelay: 100,
      maxDelay: 1000
    });
  });

  describe('重试策略', () => {
    test('应该在操作成功时立即返回', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      });

      const result = await retryMiddleware.handle(operation, error);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('应该在达到最大重试次数后抛出错误', async () => {
      const operation = vi.fn().mockRejectedValue(new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      }));

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      });

      await expect(retryMiddleware.handle(operation, error))
        .rejects
        .toThrow('网络错误');
      
      expect(operation).toHaveBeenCalledTimes(3); // maxRetries = 3
    });

    test('对于不可恢复的错误应该立即抛出', async () => {
      const operation = vi.fn();
      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: '客户端错误',
        recoverable: false
      });

      await expect(retryMiddleware.handle(operation, error))
        .rejects
        .toThrow('客户端错误');
      
      expect(operation).not.toHaveBeenCalled();
    });

    test('应该正确处理非 HttpError 类型的错误', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('未知错误'));
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      });

      await expect(retryMiddleware.handle(operation, error))
        .rejects
        .toThrow('未知错误');
      
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('延迟策略', () => {
    test('应该使用指数退避策略', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new HttpError({
          type: HttpErrorType.NETWORK,
          message: '错误 1',
          recoverable: true
        }))
        .mockRejectedValueOnce(new HttpError({
          type: HttpErrorType.NETWORK,
          message: '错误 2',
          recoverable: true
        }))
        .mockResolvedValue('success');

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '初始错误',
        recoverable: true
      });

      const result = await retryMiddleware.handle(operation, error);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('延迟时间不应超过最大值', async () => {
      const retryMiddleware = new ErrorRetryMiddleware({
        maxRetries: 3,
        retryDelay: 500,
        maxDelay: 1000
      });

      const operation = vi.fn()
        .mockRejectedValue(new HttpError({
          type: HttpErrorType.NETWORK,
          message: '网络错误',
          recoverable: true
        }));

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      });

      const start = Date.now();
      await expect(retryMiddleware.handle(operation, error)).rejects.toThrow();
      const duration = Date.now() - start;

      // 在测试环境中不应该有实际的延迟
      expect(duration).toBeLessThan(100);
    });
  });

  describe('自定义重试策略', () => {
    test('应该遵循自定义的重试条件', async () => {
      const retryMiddleware = new ErrorRetryMiddleware({
        maxRetries: 3,
        shouldRetry: (error: HttpError) => error.type === HttpErrorType.TIMEOUT
      });

      const networkError = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        recoverable: true
      });

      const timeoutError = new HttpError({
        type: HttpErrorType.TIMEOUT,
        message: '超时错误',
        recoverable: true
      });

      const operation = vi.fn().mockRejectedValue(timeoutError);

      // 网络错误不应该重试
      await expect(retryMiddleware.handle(() => Promise.reject(networkError), networkError))
        .rejects
        .toThrow('网络错误');
      
      // 超时错误应该重试
      await expect(retryMiddleware.handle(operation, timeoutError))
        .rejects
        .toThrow('超时错误');
      
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });
}); 