import type { HttpError, ErrorSeverity } from '@/utils/http/error/types';

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

type LogHandler = (error: HttpError) => void;

export class ErrorLogger {
  private static _instance: ErrorLogger | null = null;
  private logLevel: ErrorSeverity = 'info';
  private handlers: LogHandler[] = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger._instance) {
      ErrorLogger._instance = new ErrorLogger();
    }
    return ErrorLogger._instance;
  }

  static resetInstance(): void {
    ErrorLogger._instance = null;
  }

  setLogLevel(level: ErrorSeverity): void {
    this.logLevel = level;
  }

  addLogHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  log(error: HttpError): void {
    // 根据日志级别过滤
    if (!this.shouldLog(error)) {
      return;
    }

    const formattedMessage = this.formatError(error);
    const logArgs = error.metadata ? [formattedMessage, error.metadata] : [formattedMessage];

    // 根据错误严重程度选择日志级别
    switch (error.severity) {
      case 'critical':
        console.error(...logArgs);
        break;
      case 'warning':
        console.warn(...logArgs);
        break;
      case 'info':
        console.info(...logArgs);
        break;
      default:
        console.error(...logArgs);
    }

    // 调用自定义处理器
    this.handlers.forEach(handler => handler(error));
  }

  private shouldLog(error: HttpError): boolean {
    const severityLevels: ErrorSeverity[] = ['info', 'warning', 'critical'];
    const currentLevelIndex = severityLevels.indexOf(this.logLevel);
    const errorSeverity = error.severity || 'warning';
    const errorLevelIndex = severityLevels.indexOf(errorSeverity);

    return errorLevelIndex >= currentLevelIndex;
  }

  formatError(error: HttpError): string {
    const parts = [
      `[${error.type}]`,
      error.message,
      error.status ? `Status: ${error.status}` : '',
      error.metadata ? Object.entries(error.metadata)
        .map(([key, value]) => `${key}: ${value}`).join(', ') : '',
      error.stack || ''
    ];

    return parts.filter(Boolean).join(' | ');
  }
}

export const errorLogger = ErrorLogger.getInstance(); 