/**
 * @module security/logger
 * @description Provides functions for security logging.
 */

/**
 * 安全日志记录器，用于记录安全相关日志。
 * @property log - 记录日志的方法
 */
export const securityLogger = {
  /**
   * 记录安全日志。
   * @param args - 要记录的日志内容。
   */
  log: (...args: any[]): void => {
    console.log('[Security]', ...args);
  },
};
