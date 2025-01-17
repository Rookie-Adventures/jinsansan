import { HttpErrorType, type HttpError } from './types';

interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'error' | 'warning' | 'info';
}

export class ErrorNotificationManager {
  private static instance: ErrorNotificationManager;
  private readonly defaultOptions: NotificationOptions = {
    duration: 5000,
    position: 'top',
    type: 'error',
  };

  private constructor() {}

  static getInstance(): ErrorNotificationManager {
    if (!ErrorNotificationManager.instance) {
      ErrorNotificationManager.instance = new ErrorNotificationManager();
    }
    return ErrorNotificationManager.instance;
  }

  notify(error: HttpError, options?: NotificationOptions): void {
    const finalOptions = { ...this.defaultOptions, ...options };
    const message = this.getErrorMessage(error);

    // 触发全局通知事件
    const event = new CustomEvent('show-notification', {
      detail: {
        message,
        ...finalOptions,
      },
    });
    window.dispatchEvent(event);
  }

  private getErrorMessage(error: HttpError): string {
    // 根据错误类型返回友好的错误消息
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
        return error.message || '请求参数错误';
      case HttpErrorType.VALIDATION:
        return error.message || '输入数据验证失败';
      case HttpErrorType.BUSINESS:
        return error.message || '操作失败，请检查后重试';
      case HttpErrorType.CANCEL:
        return '请求已取消';
      case HttpErrorType.REACT_ERROR:
        return process.env.NODE_ENV === 'development' 
          ? `组件渲染错误: ${error.message}`
          : '页面显示异常，请刷新重试';
      default:
        return error.message || '发生未知错误，请稍后重试';
    }
  }

  showErrorPage(error: HttpError): void {
    // 对于需要跳转到错误页面的错误
    if (error.status === 404) {
      window.location.href = '/404';
    } else if (error.status === 403) {
      window.location.href = '/403';
    } else if (error.status === 500) {
      window.location.href = '/500';
    }
  }

  showErrorModal(error: HttpError): void {
    // 触发显示错误模态框的事件
    const event = new CustomEvent('show-error-modal', {
      detail: {
        title: '错误提示',
        message: this.getErrorMessage(error),
        error,
      },
    });
    window.dispatchEvent(event);
  }
}

export const errorNotificationManager = ErrorNotificationManager.getInstance(); 