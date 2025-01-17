import { HttpErrorType, type HttpError, type ErrorSeverity } from './types';

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

  private readonly defaultOptions: NotificationOptions = {
    duration: 5000,
    position: 'top',
    type: 'error',
  };

  private constructor() {}

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

  notify(error: HttpError): void {
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

  private shouldNotify(error: HttpError): boolean {
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

  private getNotificationOptions(error: HttpError): NotificationOptions {
    // 检查是否有匹配的通知规则
    const matchingRule = this.notificationRules.find(rule => rule.condition(error));
    if (matchingRule) {
      return matchingRule.options;
    }

    // 根据错误严重程度设置通知类型
    let type: NotificationOptions['type'] = 'error';
    switch (error.severity) {
      case 'warning':
        type = 'warning';
        break;
      case 'info':
        type = 'info';
        break;
      case 'critical':
        type = 'error';
        break;
    }

    return { type };
  }

  private getErrorMessage(error: HttpError): string {
    return error.message || this.getDefaultErrorMessage(error);
  }

  private getDefaultErrorMessage(error: HttpError): string {
    switch (error.type) {
      case HttpErrorType.NETWORK:
        return '网络连接失败，请检查网络设置';
      case HttpErrorType.TIMEOUT:
        return '请求超时，请稍后重试';
      case HttpErrorType.AUTH:
        return error.status === 401 ? '登录已过期，请重新登录' : '没有权限执行此操作';
      case HttpErrorType.SERVER:
        return '服务器错误，请稍后重试';
      case HttpErrorType.CLIENT:
        return '请求参数错误';
      case HttpErrorType.VALIDATION:
        return '输入数据验证失败';
      case HttpErrorType.BUSINESS:
        return '操作失败，请检查后重试';
      case HttpErrorType.CANCEL:
        return '请求已取消';
      case HttpErrorType.REACT_ERROR:
        return process.env.NODE_ENV === 'development' 
          ? `组件渲染错误: ${error.message}`
          : '页面显示异常，请刷新重试';
      default:
        return '发生未知错误，请稍后重试';
    }
  }

  private getErrorDescription(error: HttpError): string {
    const parts = [];

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

    return parts.join(' | ');
  }
}

export const errorNotificationManager = ErrorNotificationManager.getInstance(); 