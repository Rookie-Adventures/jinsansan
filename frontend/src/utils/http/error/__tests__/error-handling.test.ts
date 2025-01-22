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
    // Reset all mocks and timers
    vi.restoreAllMocks();
    vi.useFakeTimers();
    
    // Mock fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    
    // Reset singleton instance
    ErrorNotificationManager.resetInstance();
    
    // Get new instance
    notificationManager = ErrorNotificationManager.getInstance();
    
    // Mock notification handler
    showNotification = vi.fn();
    notificationManager.setNotificationHandler(showNotification);
  });

  afterEach(() => {
    vi.useRealTimers();
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

      const retryMiddleware = new ErrorRetryMiddleware({ 
        maxRetries: 3,
        retryDelay: 100
      });

      const promiseResult = retryMiddleware.handle(operation, error);
      
      // Run all timers at once
      await vi.runAllTimersAsync();
      const result = await promiseResult;

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
      const retryMiddleware = new ErrorRetryMiddleware({ 
        maxRetries: 2,
        retryDelay: 100
      });

      const promise = retryMiddleware.handle(operation, error);
      
      // Run all timers at once
      await vi.runAllTimersAsync();
      
      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          type: HttpErrorType.NETWORK,
          message: 'Network error',
          recoverable: false,
          retryCount: 2
        })
      );
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should not retry unrecoverable errors', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: false
      });

      const operation = vi.fn();
      const retryMiddleware = new ErrorRetryMiddleware();

      await expect(retryMiddleware.handle(operation, error)).rejects.toBe(error);
      expect(operation).not.toHaveBeenCalled();
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

      await reporter.report(error);

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

    test('should respect sample rate', async () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Server error'
      });

      const reporter = ErrorReporter.getInstance({
        sampleRate: 0
      });

      await reporter.report(error);
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

      const notifyPromise = notificationManager.notify(error);
      await vi.runAllTimersAsync();
      await notifyPromise;

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
      const notifyPromise = notificationManager.notify(error);
      await vi.runAllTimersAsync();
      await notifyPromise;

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

      const notifyPromise = notificationManager.notify(error);
      await vi.runAllTimersAsync();
      await notifyPromise;

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          duration: 3000
        })
      );
    });
  });
}); 