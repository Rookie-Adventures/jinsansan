export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export enum NotificationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface NotificationOptions {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}
