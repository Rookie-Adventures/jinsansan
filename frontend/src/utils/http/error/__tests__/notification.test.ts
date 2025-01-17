import { ErrorNotificationManager } from '../notification';
import { HttpError } from '../error';
import { HttpErrorType } from '../types';
import { vi, describe, test, expect, beforeEach } from 'vitest';

describe('ErrorNotificationManager', () => {
  let manager: ErrorNotificationManager;

  beforeEach(() => {
    // 恢复所有 mock
    vi.restoreAllMocks();
    // 重置单例实例
    ErrorNotificationManager.resetInstance();
    // 获取新实例
    manager = ErrorNotificationManager.getInstance();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ErrorNotificationManager.getInstance();
      const instance2 = ErrorNotificationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('notify', () => {
    test('should show notification for critical errors', () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Critical server error',
        severity: 'critical'
      });

      manager.notify(error);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('Critical server error')
        })
      );
    });

    test('should show warning notification for warning errors', () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Warning message',
        severity: 'warning'
      });

      manager.notify(error);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('Warning message')
        })
      );
    });

    test('should not show notification for info errors by default', () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Info message',
        severity: 'info'
      });

      manager.notify(error);
      expect(showNotification).not.toHaveBeenCalled();
    });
  });

  describe('setNotificationLevel', () => {
    test('should only show notifications above set level', () => {
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

      manager.notify(warningError);
      manager.notify(criticalError);

      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Critical error')
        })
      );
    });
  });

  describe('setNotificationHandler', () => {
    test('should use custom notification handler', () => {
      const customHandler = vi.fn();
      manager.setNotificationHandler(customHandler);

      const error = new HttpError({
        type: HttpErrorType.BUSINESS,
        message: 'Business error',
        severity: 'warning'
      });

      manager.notify(error);
      expect(customHandler).toHaveBeenCalled();
    });

    test('should format notification message', () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);

      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Authentication failed',
        status: 401,
        metadata: { userId: '123' },
        severity: 'warning'
      });

      manager.notify(error);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Authentication failed'),
          description: expect.stringContaining('401')
        })
      );
    });
  });

  describe('shouldNotify', () => {
    test('should not notify for ignored error types', () => {
      const showNotification = vi.fn();
      manager.setNotificationHandler(showNotification);
      manager.ignoreErrorType(HttpErrorType.NETWORK);

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error'
      });

      manager.notify(error);
      expect(showNotification).not.toHaveBeenCalled();
    });

    test('should respect notification rules', () => {
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

      manager.notify(error);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          duration: 3000
        })
      );
    });
  });
}); 