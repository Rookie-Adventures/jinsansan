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
    vi.restoreAllMocks();
    vi.useFakeTimers();
    
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
    
    ErrorNotificationManager.resetInstance();
    notificationManager = ErrorNotificationManager.getInstance();
    showNotification = vi.fn();
    notificationManager.setNotificationHandler(showNotification);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    ErrorReporter.resetInstance();
    ErrorNotificationManager.resetInstance();
    vi.restoreAllMocks();
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
        retryDelay: 0
      });

      const result = await retryMiddleware.handle(operation, error);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(error.retryCount).toBe(2);
    });

    test('should stop retrying after max attempts', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true,
        severity: 'info'
      });

      const operation = vi.fn().mockRejectedValue(error);
      const retryMiddleware = new ErrorRetryMiddleware({ 
        maxRetries: 2,
        retryDelay: 0
      });

      await expect(retryMiddleware.handle(operation, error)).rejects.toMatchObject({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        severity: 'info'
      });
      
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
    beforeEach(() => {
      fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      });
      
      global.fetch = fetchMock as typeof global.fetch;
    });

    test('should report errors with correct data', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        status: 500,
        data: { detail: 'Connection failed' },
        recoverable: true,
        severity: 'warning',
        retryCount: 0
      });

      const reporter = ErrorReporter.getInstance({
        endpoint: '/api/error-report',
        sampleRate: 1.0,
        batchSize: 1,
        flushInterval: 0
      });

      await reporter.report(error);
      await reporter.flushNow();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/error-report',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );

      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(requestBody[0]).toMatchObject({
        error: {
          type: error.type,
          message: error.message,
          status: error.status
        },
        environment: expect.any(Object)
      });
    });

    test('should respect sample rate', async () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Server error',
        severity: 'error',
        recoverable: false
      });

      const reporter = ErrorReporter.getInstance({
        endpoint: '/api/error-report',
        sampleRate: 0,
        batchSize: 1,
        flushInterval: 0
      });

      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(1);
      await reporter.report(error);
      
      expect(fetchMock).not.toHaveBeenCalled();
      mockRandom.mockRestore();
    });
  });

  describe('Notification Integration', () => {
    test('should show notification after retry fails', async () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: '服务器错误',
        severity: 'error'
      });

      const notificationManager = ErrorNotificationManager.getInstance();
      notificationManager.setNotificationLevel('error');

      await notificationManager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: '服务器错误'
        })
      );
    });

    test('should not show notification for ignored error types', async () => {
      const error = new HttpError({
        type: HttpErrorType.CANCEL,
        message: '操作已取消'
      });

      notificationManager.ignoreErrorType(HttpErrorType.CANCEL);
      await notificationManager.notify(error);

      expect(showNotification).not.toHaveBeenCalled();
    });

    test('should apply custom notification rules', async () => {
      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: '未找到资源',
        status: 404
      });

      const notificationManager = ErrorNotificationManager.getInstance();
      notificationManager.addNotificationRule(
        (err) => err.status === 404,
        { type: 'info', duration: 3000 }
      );

      await notificationManager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          duration: 3000,
          message: '未找到资源'
        })
      );
    });
  });
}); 