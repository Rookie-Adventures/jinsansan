/**
 * 错误级别枚举
 * @description 用于标识不同严重程度的错误，在错误处理和日志记录中使用
 * @remarks
 * 这些枚举值在整个应用中被广泛使用：
 * - 错误日志记录系统
 * - 错误通知组件
 * - 错误恢复机制
 * 请勿删除任何枚举值，它们都是错误处理系统的重要组成部分。
 */
export const enum ErrorLevel {
  /**
   * 警告级别
   * @description 用于标识非阻塞性问题，不影响主要功能
   * @example 用于记录非关键警告，如性能警告
   * @remarks 在 ErrorNotification 组件中用于显示自动关闭的警告消息
   */
  WARN = 'warn',

  /**
   * 错误级别
   * @description 用于标识影响部分功能但系统仍可运行的问题
   * @example 用于记录API调用失败、表单验证错误等
   * @remarks 在错误日志系统中用于记录常规错误，需要用户注意但不需要立即处理
   */
  ERROR = 'error',

  /**
   * 严重错误级别
   * @description 用于标识可能导致系统不可用的严重问题
   * @example 用于记录未捕获的异常、系统崩溃等
   * @remarks 在错误边界组件中用于捕获和处理致命错误，需要立即处理
   */
  CRITICAL = 'critical',
}

/**
 * 错误上下文接口
 * @description 提供错误发生时的上下文信息
 */
export interface ErrorContext {
  /** 错误发生的路径 */
  path?: string;
  /** HTTP 状态码 */
  status?: number;
  /** 错误相关的数据 */
  errorData?: unknown;
  /** 是否为严重错误 */
  isCritical?: boolean;
  /** 错误发生的时间戳 */
  timestamp?: number;
}

/**
 * 错误日志数据接口
 * @description 用于记录错误日志的数据结构
 * @example
 * ```typescript
 * const errorLog: ErrorLogData = {
 *   level: ErrorLevel.ERROR,
 *   context: {
 *     path: '/api/users',
 *     status: 404,
 *     timestamp: Date.now()
 *   }
 * };
 * ```
 */
export interface ErrorLogData {
  /** 错误级别 */
  level: ErrorLevel;
  /** 错误上下文 */
  context: ErrorContext;
}
