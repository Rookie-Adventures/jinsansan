import type { NotificationOptions, NotificationType } from './types';

import { errorLogger } from '../error/errorLogger';


export class NotificationManager {
  private static instance: NotificationManager;
  private notificationHandler?: (options: NotificationOptions) => void;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public setNotificationHandler(handler: (options: NotificationOptions) => void): void {
    this.notificationHandler = handler;
  }

  public showNotification(options: NotificationOptions): void {
    if (this.notificationHandler) {
      try {
        this.notificationHandler(options);
      } catch (error) {
        errorLogger.log(error instanceof Error ? error : new Error('Handler error'), {
          level: 'error',
          context: { options }
        });
      }
    } else {
      errorLogger.log(new Error('No notification handler set'), {
        level: 'warning',
        context: { options }
      });
    }
  }

  public getNotificationType(severity: NotificationType): NotificationOptions['type'] {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
