/**
 * @module security/logger
 * @description Provides functions for security logging.
 */

import { Logger } from '@/infrastructure/logging/Logger';

/**
 * 日志消息类型
 */
type LogMessage = string | number | boolean | null | undefined | Record<string, unknown>;

/**
 * 安全日志记录器配置
 */
interface SecurityLoggerConfig {
  /** 是否在生产环境中记录日志 */
  logInProduction?: boolean;
  /** 日志前缀 */
  prefix?: string;
}

/**
 * 安全日志记录器，用于记录安全相关日志。
 */
class SecurityLogger {
  private static instance: SecurityLogger;
  private logger: Logger;
  private config: SecurityLoggerConfig;

  private constructor(config: SecurityLoggerConfig = {}) {
    this.logger = Logger.getInstance();
    this.config = {
      logInProduction: false,
      prefix: '[Security]',
      ...config,
    };
  }

  public static getInstance(config?: SecurityLoggerConfig): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger(config);
    }
    return SecurityLogger.instance;
  }

  /**
   * 记录安全日志。
   * @param message - 主要日志消息
   * @param context - 日志上下文信息
   */
  public log(message: LogMessage, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'production' && !this.config.logInProduction) {
      return;
    }

    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    this.logger.info(`${prefix}${message}`, context);
  }

  /**
   * 记录安全警告。
   * @param message - 警告消息
   * @param context - 日志上下文信息
   */
  public warn(message: LogMessage, context?: Record<string, unknown>): void {
    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    this.logger.warn(`${prefix}${message}`, context);
  }

  /**
   * 记录安全错误。
   * @param message - 错误消息
   * @param context - 日志上下文信息
   */
  public error(message: LogMessage, context?: Record<string, unknown>): void {
    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    this.logger.error(`${prefix}${message}`, context);
  }
}

// 导出默认实例
export const securityLogger = SecurityLogger.getInstance();
