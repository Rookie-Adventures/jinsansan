import { NotificationOptions, NotificationSeverity } from './types';

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

  public getNotificationType(severity: NotificationSeverity): NotificationOptions['type'] {
    switch (severity) {
      case NotificationSeverity.CRITICAL:
      case NotificationSeverity.ERROR:
        return 'error';
      case NotificationSeverity.WARNING:
        return 'warning';
      case NotificationSeverity.INFO:
        return 'info';
      default:
        return 'info';
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
