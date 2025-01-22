import { errorConfig } from './config';
import { HttpError as HttpErrorClass } from './error';
import { errorMessages } from './messages';
import { ErrorReporter } from './reporter';
import { ErrorRetryMiddleware } from './retry';
import { HttpErrorType, type ErrorSeverity, type HttpError } from './types';

interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'error' | 'warning' | 'info';
  description?: string;
}

type NotificationHandler = (options: NotificationOptions & { message: string }) => void;
type NotificationRule = (error: HttpError) => boolean;

export class ErrorNotificationManager {
  private static _instance: ErrorNotificationManager | null = null;
  private notificationHandler?: NotificationHandler;
  private notificationLevel: ErrorSeverity = 'warning';
  private ignoredTypes: Set<HttpErrorType> = new Set();
  private notificationRules: Array<{
    condition: NotificationRule;
    options: NotificationOptions;
  }> = [];
  private retryMiddleware: ErrorRetryMiddleware;
  private errorReporter: ErrorReporter;

  private readonly defaultOptions: Required<Pick<NotificationOptions, 'duration' | 'position' | 'type'>> = {
    duration: errorConfig.notification.defaultDuration,
    position: 'top',
    type: 'error',
  };

  private constructor() {
    this.retryMiddleware = new ErrorRetryMiddleware();
    this.errorReporter = ErrorReporter.getInstance({
      endpoint: errorConfig.reporting.endpoint,
      sampleRate: errorConfig.reporting.sampleRate,
      maxQueueSize: errorConfig.reporting.maxQueueSize,
      maxRetries: errorConfig.reporting.maxRetries,
      initialRetryDelay: errorConfig.reporting.initialRetryDelay
    });
  }

  static getInstance(): ErrorNotificationManager {
    if (!ErrorNotificationManager._instance) {
      ErrorNotificationManager._instance = new ErrorNotificationManager();
    }
    return ErrorNotificationManager._instance;
  }

  static resetInstance(): void {
    ErrorNotificationManager._instance = null;
  }

  setNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandler = handler;
  }

  setNotificationLevel(level: ErrorSeverity): void {
    this.notificationLevel = level;
  }

  ignoreErrorType(type: HttpErrorType): void {
    this.ignoredTypes.add(type);
  }

  addNotificationRule(condition: NotificationRule, options: NotificationOptions): void {
    if (options.duration) {
      options.duration = Math.min(options.duration, errorConfig.notification.maxDuration);
    }
    this.notificationRules.push({ condition, options });
  }

  async notify(error: HttpError): Promise<void> {
    const httpError = error as HttpErrorClass;
    
    try {
      await this.retryMiddleware.handle(
        () => Promise.reject(httpError),
        httpError
      );
    } catch (retryError) {
      if (retryError instanceof Error && 'type' in retryError) {
        const errorInstance = retryError as HttpErrorClass;
        this.showNotification(errorInstance);
        this.errorReporter.report(errorInstance);
      }
    }
  }

  private showNotification(error: HttpErrorClass): void {
    if (!this.shouldNotify(error)) {
      return;
    }

    const options = this.getNotificationOptions(error);
    const message = this.getErrorMessage(error);
    const description = this.getErrorDescription(error);

    const duration = Math.min(
      options.duration ?? this.defaultOptions.duration,
      errorConfig.notification.maxDuration
    );

    const notificationData = {
      message,
      description,
      ...this.defaultOptions,
      ...options,
      duration,
      position: options.position || this.defaultOptions.position,
      type: options.type || this.getNotificationTypeFromError(error)
    };

    if (this.notificationHandler) {
      this.notificationHandler(notificationData);
      return;
    }

    const event = new CustomEvent('show-notification', {
      detail: notificationData,
    });
    window.dispatchEvent(event);
  }

  private shouldNotify(error: HttpErrorClass): boolean {
    if (this.ignoredTypes.has(error.type)) {
      return false;
    }

    const matchingRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchingRule) {
      return true;
    }

    const severityLevels: ErrorSeverity[] = ['info', 'warning', 'critical'];
    const currentLevelIndex = severityLevels.indexOf(this.notificationLevel);
    const errorLevelIndex = severityLevels.indexOf(error.severity || 'info');

    return errorLevelIndex >= currentLevelIndex;
  }

  private getNotificationOptions(error: HttpErrorClass): NotificationOptions {
    const matchingRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchingRule) {
      return {
        ...matchingRule.options,
        duration: Math.min(
          matchingRule.options.duration ?? this.defaultOptions.duration,
          errorConfig.notification.maxDuration
        )
      };
    }

    return {
      type: this.getNotificationTypeFromError(error)
    };
  }

  private getErrorMessage(error: HttpErrorClass): string {
    const template = errorMessages[error.type];
    if (!template) {
      return error.message || errorMessages[HttpErrorType.UNKNOWN].message;
    }

    if (error.type === HttpErrorType.REACT_ERROR && process.env.NODE_ENV === 'development') {
      return template.message.replace('${error}', error.message);
    }

    return template.message;
  }

  private getErrorDescription(error: HttpErrorClass): string {
    const template = errorMessages[error.type];
    const parts = [template?.description || ''];

    if (error.status) {
      parts.push(`状态码: ${error.status}`);
    }

    if (error.metadata) {
      if (error.metadata.requestId) {
        parts.push(`请求ID: ${error.metadata.requestId}`);
      }
      if (error.metadata.timestamp) {
        parts.push(`时间: ${error.metadata.timestamp}`);
      }
      if (error.metadata.userId) {
        parts.push(`用户ID: ${error.metadata.userId}`);
      }
    }

    return parts.filter(Boolean).join(' | ');
  }

  private getNotificationTypeFromError(error: HttpErrorClass): 'error' | 'warning' | 'info' {
    switch (error.severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  }
}

export const errorNotificationManager = ErrorNotificationManager.getInstance(); 