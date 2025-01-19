/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * 日志数据接口
 */
interface LogData {
  message: string;
  stack?: string;
  level: LogLevel;
  timestamp: number;
  context: Record<string, unknown>;
}

/**
 * 日志上下文
 */
export interface LogContext {
  level: LogLevel;
  context?: Record<string, unknown>;
}

/**
 * 日志输出接口
 */
interface LogOutput {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * 开发环境日志输出
 */
class DevLogOutput implements LogOutput {
  // eslint-disable-next-line no-console
  debug = console.debug.bind(console);
  // eslint-disable-next-line no-console
  info = console.info.bind(console);
  // eslint-disable-next-line no-console
  warn = console.warn.bind(console);
  // eslint-disable-next-line no-console
  error = console.error.bind(console);
}

/**
 * 生产环境日志输出（静默）
 */
class ProductionLogOutput implements LogOutput {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

/**
 * 错误日志记录器
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly apiBaseUrl: string;
  private readonly isDevelopment: boolean;
  private readonly logOutput: LogOutput;

  private constructor() {
    this.apiBaseUrl = process.env.NODE_ENV === 'test' 
      ? 'http://localhost:3000'
      : window.location.origin;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logOutput = this.isDevelopment 
      ? new DevLogOutput()
      : new ProductionLogOutput();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * 记录错误日志
   */
  async log(error: Error, options: LogContext): Promise<void> {
    const logData: LogData = {
      message: error.message,
      stack: error.stack,
      level: options.level,
      timestamp: Date.now(),
      context: options.context || {},
    };

    if (this.isDevelopment) {
      this.devLog(logData);
    }

    try {
      await this.sendToServer(logData);
    } catch {
      this.saveToLocalStorage(logData);
    }
  }

  /**
   * 开发环境下的日志输出
   */
  private devLog(logData: LogData): void {
    const { level, message, context } = logData;
    switch (level) {
      case 'debug':
        this.logOutput.debug(message, context);
        break;
      case 'info':
        this.logOutput.info(message, context);
        break;
      case 'warn':
        this.logOutput.warn(message, context);
        break;
      case 'error':
      case 'critical':
        this.logOutput.error(message, context);
        break;
    }
  }

  /**
   * 发送日志到服务器
   */
  private async sendToServer(logData: LogData): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage(logData: LogData): void {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]') as LogData[];
      logs.push(logData);
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (error) {
      if (this.isDevelopment) {
        this.logOutput.error('Failed to save error log to localStorage:', error);
      }
    }
  }
}

export const errorLogger = ErrorLogger.getInstance(); 