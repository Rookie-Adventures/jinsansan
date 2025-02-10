/* eslint-disable no-console */
interface ErrorLoggerOptions {
  level?: 'error' | 'warn' | 'info';
  context?: Record<string, unknown>;
}

/**
 * 错误日志记录服务
 * 在开发环境下使用 console 输出
 * 在生产环境下可以配置将日志发送到日志服务
 */
class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: Error, options: ErrorLoggerOptions = {}): void {
    const { level = 'error', context = {} } = options;
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message: error.message,
      stack: error.stack,
      ...context,
    };

    if (process.env.NODE_ENV === 'development') {
      switch (level) {
        case 'error':
          console.error(logData);
          break;
        case 'warn':
          console.warn(logData);
          break;
        case 'info':
          console.info(logData);
          break;
      }
    }

    // TODO: 在生产环境中，可以将错误发送到日志服务
    // if (process.env.NODE_ENV === 'production') {
    //   sendToLogService(logData);
    // }
  }
}

export const errorLogger = ErrorLogger.getInstance();
