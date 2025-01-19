import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { HttpError } from '../error';
import { ErrorNotificationManager } from '../notification';
import { ErrorReporter } from '../reporter';
import { ErrorRetryMiddleware } from '../retry';
import { HttpErrorType } from '../types';

describe('Error Handling Integration', () => {
  let notificationManager: ErrorNotificationManager;
  let showNotification: Mock;
  let fetchMock: Mock;

  beforeEach(() => {
    // 重置所有mock
    vi.restoreAllMocks();
    
    // Mock fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    
    // 重置单例实例
    ErrorNotificationManager.resetInstance();
    
    // 获取新实例
    notificationManager = ErrorNotificationManager.getInstance();
    
    // Mock通知处理函数
    showNotification = vi.fn();
    notificationManager.setNotificationHandler(showNotification);
  });

  describe('Error Retry', () => {
    test('should retry network errors', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true
      });

      const operation = vi.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const retryMiddleware = new ErrorRetryMiddleware();
      const result = await retryMiddleware.handle(operation, error);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(error.retryCount).toBe(2);
    });

    test('should stop retrying after max attempts', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true
      });

      const operation = vi.fn().mockRejectedValue(error);
      const retryMiddleware = new ErrorRetryMiddleware({ maxRetries: 2 });

      await expect(retryMiddleware.handle(operation, error))
        .rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(2);
      expect(error.retryCount).toBe(2);
      expect(error.recoverable).toBe(false);
    });
  });

  describe('Error Reporting', () => {
    test('should report errors with correct data', async () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Server error',
        status: 500,
        metadata: {
          requestId: '123',
          userId: 'user-123'
        }
      });

      fetchMock.mockResolvedValueOnce({ ok: true });

      const reporter = ErrorReporter.getInstance({
        endpoint: '/api/error-report',
        sampleRate: 1.0
      });

      reporter.report(error);

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/error-report',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"message":"Server error"')
        })
      );
    });

    test('should respect sample rate', () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Server error'
      });

      const reporter = ErrorReporter.getInstance({
        sampleRate: 0
      });

      reporter.report(error);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('Notification Integration', () => {
    test('should show notification after retry fails', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true,
        severity: 'critical'
      });

      await notificationManager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('网络连接失败')
        })
      );
    });

    test('should not show notification for ignored error types', async () => {
      const error = new HttpError({
        type: HttpErrorType.CANCEL,
        message: 'Operation cancelled'
      });

      notificationManager.ignoreErrorType(HttpErrorType.CANCEL);
      await notificationManager.notify(error);

      expect(showNotification).not.toHaveBeenCalled();
    });

    test('should apply custom notification rules', async () => {
      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Not found',
        status: 404
      });

      notificationManager.addNotificationRule(
        (err) => err.status === 404,
        { type: 'info', duration: 3000 }
      );

      await notificationManager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          duration: 3000
        })
      );
    });
  });
}); 