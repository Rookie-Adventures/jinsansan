import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { NotificationOptions } from '../types';

import { errorLogger } from '../../error/errorLogger';
import { NotificationManager } from '../manager';

// Mock errorLogger
vi.mock('../../error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;
  const mockHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    notificationManager = NotificationManager.getInstance();
  });

  describe('基础功能', () => {
    it('应该是单例模式', () => {
      const instance1 = NotificationManager.getInstance();
      const instance2 = NotificationManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('应该能设置通知处理器', () => {
      notificationManager.setNotificationHandler(mockHandler);
      const options: NotificationOptions = {
        message: 'Test notification',
        type: 'info',
      };
      notificationManager.showNotification(options);
      expect(mockHandler).toHaveBeenCalledWith(options);
    });

    it('在没有设置处理器时应该记录警告', () => {
      // @ts-expect-error 故意传入 undefined 以测试错误处理
      notificationManager.setNotificationHandler(undefined);
      const options: NotificationOptions = {
        message: 'Test notification',
        type: 'info',
      };
      notificationManager.showNotification(options);
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'warning',
          context: { options },
        })
      );
    });
  });

  describe('通知类型映射', () => {
    it.each([
      ['critical', 'error'],
      ['error', 'error'],
      ['warning', 'warning'],
      ['info', 'info'],
      ['unknown' as any, 'info'],
    ])('应该将 %s 严重性映射为 %s 类型', (severity, expectedType) => {
      const type = notificationManager.getNotificationType(severity);
      expect(type).toBe(expectedType);
    });
  });

  describe('通知显示', () => {
    beforeEach(() => {
      notificationManager.setNotificationHandler(mockHandler);
    });

    it('应该正确显示不同类型的通知', () => {
      const notifications: NotificationOptions[] = [
        { message: 'Info message', type: 'info' },
        { message: 'Warning message', type: 'warning' },
        { message: 'Error message', type: 'error' },
      ];

      notifications.forEach(options => {
        notificationManager.showNotification(options);
        expect(mockHandler).toHaveBeenCalledWith(options);
      });

      expect(mockHandler).toHaveBeenCalledTimes(notifications.length);
    });

    it('应该处理带有额外选项的通知', () => {
      const options: NotificationOptions = {
        message: 'Test notification',
        type: 'info',
        duration: 3000,
        description: '这是一个带有额外选项的通知',
      };

      notificationManager.showNotification(options);
      expect(mockHandler).toHaveBeenCalledWith(options);
    });

    it('应该处理没有可选参数的通知', () => {
      const options: NotificationOptions = {
        message: 'Simple notification',
        type: 'info',
      };

      notificationManager.showNotification(options);
      expect(mockHandler).toHaveBeenCalledWith(options);
    });
  });

  describe('错误处理', () => {
    it('应该优雅地处理处理器抛出的错误', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      notificationManager.setNotificationHandler(errorHandler);

      const options: NotificationOptions = {
        message: 'Test notification',
        type: 'info',
      };

      // 不应该抛出错误
      expect(() => notificationManager.showNotification(options)).not.toThrow();
      expect(errorHandler).toHaveBeenCalledWith(options);
    });

    it('应该处理无效的通知选项', () => {
      notificationManager.setNotificationHandler(mockHandler);

      const invalidOptions = {
        message: '', // 空消息
        type: 'invalid-type' as any,
      };

      notificationManager.showNotification(invalidOptions);
      expect(mockHandler).toHaveBeenCalledWith(invalidOptions);
    });
  });
}); 