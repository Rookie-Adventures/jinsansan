import { ErrorSeverity } from '../http/error/types';

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

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
      this.notificationHandler(options);
    } else {
      console.warn('No notification handler set');
    }
  }

  public getNotificationType(severity: ErrorSeverity): NotificationOptions['type'] {
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