/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志数据类型
 */
export type LogData = Record<string, unknown>;

/**
 * 日志条目接口
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 附加数据 */
  data?: LogData;
  /** 时间戳 */
  timestamp: number;
  /** 上下文信息 */
  context?: {
    /** 当前URL */
    url?: string;
    /** 用户ID */
    userId?: string;
    /** 会话ID */
    sessionId?: string;
    /** 用户代理 */
    userAgent?: string;
  };
}

/**
 * 日志配置接口
 */
export interface LogConfig {
  /** 日志队列最大大小 */
  maxQueueSize: number;
  /** 日志刷新间隔（毫秒） */
  flushInterval: number;
  /** 日志级别 */
  level: LogLevel;
  /** 是否启用控制台输出 */
  enableConsole: boolean;
  /** 是否启用远程日志 */
  enableRemote: boolean;
  /** 远程日志接口地址 */
  remoteUrl?: string;
}
