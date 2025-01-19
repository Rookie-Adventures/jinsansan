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

  private readonly defaultOptions: NotificationOptions = {
    duration: 5000,
    position: 'top',
    type: 'error',
  };

  private constructor() {
    this.retryMiddleware = new ErrorRetryMiddleware();
    this.errorReporter = ErrorReporter.getInstance();
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
    this.notificationRules.push({ condition, options });
  }

  async notify(error: HttpError): Promise<void> {
    // 确保 error 具有必需的属性
    const httpError = error as HttpErrorClass;
    
    // 尝试重试
    try {
      await this.retryMiddleware.handle(
        () => Promise.reject(httpError),
        httpError
      );
    } catch (retryError) {
      if (retryError instanceof Error && 'type' in retryError) {
        const errorInstance = retryError as HttpErrorClass;
        // 重试失败，继续显示通知
        this.showNotification(errorInstance);
        // 上报错误
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

    const notificationData = {
      message,
      description,
      ...this.defaultOptions,
      ...options,
      duration: options.duration || this.defaultOptions.duration,
      position: options.position || this.defaultOptions.position,
      type: options.type || this.getNotificationTypeFromError(error)
    };

    if (this.notificationHandler) {
      this.notificationHandler(notificationData);
      return;
    }

    // 触发全局通知事件
    const event = new CustomEvent('show-notification', {
      detail: notificationData,
    });
    window.dispatchEvent(event);
  }

  private shouldNotify(error: HttpErrorClass): boolean {
    // 检查是否是被忽略的错误类型
    if (this.ignoredTypes.has(error.type)) {
      return false;
    }

    // 检查是否有匹配的规则
    const matchingRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchingRule) {
      return true;
    }

    // 检查错误级别
    const severityLevels: ErrorSeverity[] = ['info', 'warning', 'critical'];
    const currentLevelIndex = severityLevels.indexOf(this.notificationLevel);
    const errorLevelIndex = severityLevels.indexOf(error.severity || 'info');

    return errorLevelIndex >= currentLevelIndex;
  }

  private getNotificationOptions(error: HttpErrorClass): NotificationOptions {
    // 检查是否有匹配的通知规则
    const matchingRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchingRule) {
      return matchingRule.options;
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

    // 如果是React错误且在开发环境，替换错误信息
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