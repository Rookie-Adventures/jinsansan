import { errorConfig } from './config';
import { ErrorReporter } from './reporter';
import { ErrorRetryMiddleware } from './retry';
import { HttpErrorType, type ErrorSeverity, type HttpError } from './types';

interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'error' | 'warning' | 'info';
  description?: string;
}

type NotificationHandler = (options: Required<NotificationOptions> & { message: string }) => void;
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
    if (!this.shouldNotify(error) || !this.notificationHandler) {
      return;
    }

    // 查找匹配的自定义规则
    const matchedRule = this.notificationRules.find(rule => rule.condition(error));
    
    const notification = {
      type: matchedRule?.options.type || this.getNotificationType(error.severity || 'error'),
      message: error.message || '未知错误',
      description: this.getErrorDescription(error),
      duration: matchedRule?.options.duration || this.getDuration(error.severity || 'error'),
      position: matchedRule?.options.position || 'top'
    };

    await Promise.resolve(); // 确保在下一个微任务中执行
    this.notificationHandler(notification);
  }

  private shouldNotify(error: HttpError): boolean {
    // 先检查是否被忽略
    if (this.ignoredTypes.has(error.type)) {
      return false;
    }

    // 检查自定义规则
    const matchedRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchedRule) {
      return true;
    }

    // 检查严重程度
    const errorLevel = this.getSeverityLevel(error.severity || 'error');
    const currentLevel = this.getSeverityLevelValue(this.notificationLevel);
    return errorLevel >= currentLevel;
  }

  private getNotificationType(severity: string): 'error' | 'warning' | 'info' {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  private getErrorDescription(error: HttpError): string {
    const parts: string[] = [];
    
    if (error.status) {
      parts.push(`状态码: ${error.status}`);
    }
    
    if (error.code) {
      parts.push(`错误码: ${error.code}`);
    }

    // 根据错误类型添加详细描述
    switch (error.type) {
      case HttpErrorType.SERVER:
        parts.push('服务器内部错误');
        break;
      case HttpErrorType.CLIENT:
        parts.push('请检查输入参数');
        break;
      case HttpErrorType.NETWORK:
        parts.push('网络连接错误');
        break;
      case HttpErrorType.AUTH:
        parts.push('认证失败');
        break;
      case HttpErrorType.VALIDATION:
        parts.push('请检查输入参数');
        break;
      default:
        if (error.description) {
          parts.push(error.description);
        } else if (error.message) {
          parts.push(error.message);
        } else {
          parts.push('发生未知错误');
        }
    }
    
    return parts.join(' | ');
  }

  private getDuration(severity: string): number {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 0; // 不自动关闭
      case 'error':
        return 5000;
      case 'warning':
        return 4000;
      default:
        return 3000;
    }
  }

  private getSeverityLevel(severity: string): number {
    switch (severity) {
      case 'critical':
        return 4;
      case 'error':
        return 3;
      case 'warning':
        return 2;
      case 'info':
        return 1;
      default:
        return 0;
    }
  }

  private getSeverityLevelValue(severity: ErrorSeverity): number {
    switch (severity) {
      case 'critical':
        return 4;
      case 'error':
        return 3;
      case 'warning':
        return 2;
      case 'info':
        return 1;
      default:
        return 0;
    }
  }
}

export const errorNotificationManager = ErrorNotificationManager.getInstance(); 