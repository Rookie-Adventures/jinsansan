import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { HttpError } from '../error';
import { ErrorNotificationManager } from '../notification';
import { HttpErrorType } from '../types';

describe('ErrorNotificationManager', () => {
  let manager: ErrorNotificationManager;
  let showNotification: Mock;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    ErrorNotificationManager.resetInstance();
    showNotification = vi.fn();
    manager = ErrorNotificationManager.getInstance();
    manager.setNotificationHandler(showNotification);
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
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: '服务器错误',
        severity: 'critical'
      });

      manager = ErrorNotificationManager.getInstance();
      manager.setNotificationHandler(showNotification);

      await manager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: '服务器错误',
          description: '服务器内部错误'
        })
      );
    });

    test('should show warning notification for warning errors', async () => {
      const error = new HttpError({
        type: HttpErrorType.VALIDATION,
        message: '参数错误',
        severity: 'warning'
      });

      manager = ErrorNotificationManager.getInstance();
      manager.setNotificationHandler(showNotification);

      await manager.notify(error);

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: '参数错误',
          description: '请检查输入参数'
        })
      );
    });

    test('should not show notification for info errors by default', async () => {
      const error = new HttpError({
        type: HttpErrorType.INFO,
        message: '操作提示',
        severity: 'info'
      });

      manager = ErrorNotificationManager.getInstance();
      manager.setNotificationHandler(showNotification);

      await manager.notify(error);

      expect(showNotification).not.toHaveBeenCalled();
    });
  });

  describe('setNotificationLevel', () => {
    test('should only show notifications above set level', async () => {
      manager = ErrorNotificationManager.getInstance();
      manager.setNotificationHandler(showNotification);
      manager.setNotificationLevel('critical');

      const warningError = new HttpError({
        type: HttpErrorType.WARNING,
        message: '警告信息',
        severity: 'warning'
      });

      const criticalError = new HttpError({
        type: HttpErrorType.ERROR,
        message: '严重错误',
        severity: 'critical'
      });

      await manager.notify(warningError);
      await manager.notify(criticalError);

      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '严重错误'
        })
      );
    });
  });

  describe('setNotificationHandler', () => {
    test('should format notification message', async () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: '认证失败',
        status: 401,
        metadata: { userId: '123' },
        severity: 'warning'
      });

      await manager.notify(error);
      await vi.runAllTimersAsync();

      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: '认证失败',
          description: expect.stringContaining('401')
        })
      );
    });
  });

  describe('shouldNotify', () => {
    test('should not notify for ignored error types', async () => {
      manager.ignoreErrorType(HttpErrorType.NETWORK);

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error'
      });

      const notifyPromise = manager.notify(error);
      await vi.runAllTimersAsync();
      await notifyPromise;

      expect(showNotification).not.toHaveBeenCalled();
    });

    test('should respect notification rules', async () => {
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