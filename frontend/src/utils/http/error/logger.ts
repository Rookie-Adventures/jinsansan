import type { HttpError } from '@/utils/http/error/types';

export interface ErrorLogData {
  type: string;
  message: string;
  timestamp: number;
  url?: string;
  method?: string;
  status?: number;
  data?: unknown;
  stack?: string;
  userAgent?: string;
  platform?: string;
  breadcrumbs?: Array<{
    action: string;
    timestamp: number;
    data?: unknown;
  }>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly maxLocalLogs = 100;
  private readonly localStorageKey = 'error_logs';

  private constructor() {
    this.initErrorListener();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private initErrorListener(): void {
    window.addEventListener('error', (event) => {
      this.log({
        type: 'WINDOW_ERROR',
        message: event.message,
        stack: event.error?.stack,
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log({
        type: 'UNHANDLED_REJECTION',
        message: event.reason?.message || 'Unhandled Promise rejection',
        stack: event.reason?.stack,
        data: event.reason,
      });
    });
  }

  log(error: Partial<ErrorLogData> | HttpError): void {
    const errorLog: ErrorLogData = {
      type: error.type || 'UNKNOWN',
      message: error.message || 'Unknown error',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ...error,
    };

    // 控制台输出
    this.consoleLog(errorLog);

    // 保存到本地存储
    this.saveToLocalStorage(errorLog);

    // 上报到服务器
    this.reportToServer(errorLog).catch((err) => {
      console.error('Failed to report error:', err);
    });
  }

  private consoleLog(errorLog: ErrorLogData): void {
    if (process.env.NODE_ENV !== 'production') {
      console.group('Error Log');
      console.error(errorLog.message);
      console.error('Type:', errorLog.type);
      console.error('Timestamp:', new Date(errorLog.timestamp).toISOString());
      if (errorLog.stack) {
        console.error('Stack:', errorLog.stack);
      }
      if (errorLog.data) {
        console.error('Additional Data:', errorLog.data);
      }
      console.groupEnd();
    }
  }

  private saveToLocalStorage(errorLog: ErrorLogData): void {
    try {
      const logs = this.getLocalLogs();
      logs.unshift(errorLog);
      
      // 限制本地存储的日志数量
      if (logs.length > this.maxLocalLogs) {
        logs.length = this.maxLocalLogs;
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save error log to localStorage:', error);
    }
  }

  private async reportToServer(errorLog: ErrorLogData): Promise<void> {
    // TODO: 实现错误上报到服务器的逻辑
    // 可以使用 Beacon API 或者普通的 HTTP 请求
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(errorLog)], { type: 'application/json' });
      navigator.sendBeacon('/api/error-logs', blob);
    }
  }

  getLocalLogs(): ErrorLogData[] {
    try {
      const logsStr = localStorage.getItem(this.localStorageKey);
      return logsStr ? JSON.parse(logsStr) : [];
    } catch {
      return [];
    }
  }

  clearLocalLogs(): void {
    localStorage.removeItem(this.localStorageKey);
  }
}

export const errorLogger = ErrorLogger.getInstance(); 