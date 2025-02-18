import { ErrorSeverity } from '../http/types';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationSeverity = ErrorSeverity;

export interface NotificationOptions {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}
