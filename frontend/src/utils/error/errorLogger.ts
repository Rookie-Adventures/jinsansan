/**
 * 日志级别相关类型定义
 * @packageDocumentation
 */

import type { Severity } from '../../types/severity';

import { SeverityLevel } from '../../types/severity';

/**
 * 错误日志级别
 * @description 使用统一的错误级别定义，并扩展开发环境特有的级别
 */
export type ErrorLogLevel = Severity | 'debug' | 'warn';

/**
 * 日志数据接口
 * @description 定义了日志记录的数据结构
 */
interface LogData {
  /** 日志消息 */
  message: string;
  /** 错误堆栈信息 */
  stack?: string;
  /** 日志级别 */
  level: ErrorLogLevel;
  /** 时间戳 */
  timestamp: number;
  /** 上下文信息 */
  context: Record<string, unknown>;
}

/**
 * 日志上下文
 * @description 定义了日志记录的上下文信息
 */
export interface LogContext {
  /** 日志级别 */
  level: ErrorLogLevel;
  /** 上下文信息 */
  context?: Record<string, unknown>;
}

/**
 * 日志输出接口
 * @description 定义了日志输出的基本方法
 */
interface LogOutput {
  /** 调试级别日志 */
  debug(message: string, ...args: unknown[]): void;
  /** 信息级别日志 */
  info(message: string, ...args: unknown[]): void;
  /** 警告级别日志 */
  warn(message: string, ...args: unknown[]): void;
  /** 错误级别日志 */
  error(message: string, ...args: unknown[]): void;
}

/**
 * 开发环境日志输出
 * @description 仅在开发环境下使用 console 进行日志输出
 */
class DevLogOutput implements LogOutput {
  /* eslint-disable no-console -- 开发环境需要使用 console 进行日志输出 */
  debug(message: string, ...args: unknown[]): void {
    console.debug(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(message, ...args);
  }
  /* eslint-enable no-console */
}

/**
 * 生产环境日志输出（静默）
 * @description 生产环境中不输出日志到控制台，但保留方法以满足接口要求
 */
class ProductionLogOutput implements LogOutput {
  /* eslint-disable @typescript-eslint/no-unused-vars -- 生产环境不需要实际的日志输出 */
  debug(_message: string, ..._args: unknown[]): void {
    // 生产环境不输出日志
  }

  info(_message: string, ..._args: unknown[]): void {
    // 生产环境不输出日志
  }

  warn(_message: string, ..._args: unknown[]): void {
    // 生产环境不输出日志
  }

  error(_message: string, ..._args: unknown[]): void {
    // 生产环境不输出日志
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * 错误日志记录器
 * @description 单例模式的错误日志记录器，支持开发和生产环境
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly apiBaseUrl: string;
  private readonly isDevelopment: boolean;
  private readonly logOutput: LogOutput;

  private constructor() {
    this.apiBaseUrl =
      process.env.NODE_ENV === 'test' ? 'http://localhost:3000' : window.location.origin;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logOutput = this.isDevelopment ? new DevLogOutput() : new ProductionLogOutput();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * 记录错误日志
   * @param error - 错误对象
   * @param options - 日志选项
   */
  async log(error: Error, options: LogContext): Promise<void> {
    const logData: LogData = {
      message: error.message,
      stack: error.stack,
      level: options.level,
      timestamp: Date.now(),
      context: options.context || {},
    };

    // 只在开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
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
   * @param logData - 日志数据
   */
  private devLog(logData: LogData): void {
    const { level, message, context } = logData;
    switch (level) {
      case 'debug':
        this.logOutput.debug(message, { level, ...context });
        break;
      case SeverityLevel.INFO:
        this.logOutput.info(message, { level, ...context });
        break;
      case 'warn':
      case SeverityLevel.WARNING:
        this.logOutput.warn(message, { level, ...context });
        break;
      case SeverityLevel.ERROR:
      case SeverityLevel.CRITICAL:
        this.logOutput.error(message, { level, ...context });
        break;
    }
  }

  /**
   * 发送日志到服务器
   * @param logData - 日志数据
   * @throws 当服务器响应不成功时抛出错误
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
   * @param logData - 日志数据
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
