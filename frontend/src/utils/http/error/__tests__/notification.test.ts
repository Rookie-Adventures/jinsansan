import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpError } from '../error';
import { ErrorNotificationManager } from '../notification';
import { HttpErrorType } from '../types';

describe('ErrorNotificationManager', () => {
  let manager: ErrorNotificationManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    ErrorNotificationManager.resetInstance();
    manager = ErrorNotificationManager.getInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ErrorNotificationManager.getInstance();
      const instance2 = ErrorNotificationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('notify', () => {
    test('should show notification for critical errors', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Critical server error',
        severity: 'critical'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('Critical server error')
        })
      );
    });

    test('should show warning notification for warning errors', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Warning message',
        severity: 'warning'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('Warning message')
        })
      );
    });

    test('should not show notification for info errors by default', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Info message',
        severity: 'info'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(showNotification).not.toHaveBeenCalled();
    });
  });

  describe('setNotificationLevel', () => {
    test('should only show notifications above set level', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);
      manager.setNotificationLevel('critical');

      const warningError = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Warning message',
        severity: 'warning'
      });

      const criticalError = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Critical error',
        severity: 'critical'
      });

      const warningPromise = manager.notify(warningError);
      const criticalPromise = manager.notify(criticalError);
      
      vi.advanceTimersByTime(0);
      await Promise.all([warningPromise, criticalPromise]);

      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Critical error')
        })
      );
    });
  });

  describe('setNotificationHandler', () => {
    test('should use custom notification handler', async () => {
      const customHandler = vi.fn();
      manager.setNotificationHandler(customHandler);

      const error = new HttpError({
        type: HttpErrorType.BUSINESS,
        message: 'Business error',
        severity: 'warning'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(customHandler).toHaveBeenCalled();
    });

    test('should format notification message', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Authentication failed',
        status: 401,
        metadata: { userId: '123' },
        severity: 'warning'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Authentication failed'),
          description: expect.stringContaining('401')
        })
      );
    });
  });

  describe('shouldNotify', () => {
    test('should not notify for ignored error types', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);
      manager.ignoreErrorType(HttpErrorType.NETWORK);

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error'
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
      await notifyPromise;

      expect(showNotification).not.toHaveBeenCalled();
    });

    test('should respect notification rules', async () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);
      
      manager.addNotificationRule((error) => error.status === 404, {
        type: 'info',
        duration: 3000
      });

      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Not found',
        status: 404
      });

      const notifyPromise = manager.notify(error);
      vi.advanceTimersByTime(0);
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