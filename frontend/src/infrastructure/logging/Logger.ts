import { errorLogger } from '../../utils/errorLogger';
import { LogData, LogLevel } from './types';

export class Logger {
  private static instance: Logger;
  private logQueue: Array<{ level: LogLevel; message: string; data?: LogData }> = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000; // 5秒

  private constructor() {
    this.startAutoFlush();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private startAutoFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    try {
      const logs = [...this.logQueue];
      this.logQueue = [];

      // 在生产环境发送到服务器
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs }),
        });
      }

      // 在开发环境打印到控制台
      if (process.env.NODE_ENV === 'development') {
        logs.forEach(({ level, message, data }) => {
          switch (level) {
            case 'debug':
              errorLogger.log(new Error(message), { level: 'info', context: data });
              break;
            case 'info':
              errorLogger.log(new Error(message), { level: 'info', context: data });
              break;
            case 'warn':
              errorLogger.log(new Error(message), { level: 'warn', context: data });
              break;
            case 'error':
              errorLogger.log(new Error(message), { level: 'error', context: data });
              break;
          }
        });
      }
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Failed to flush logs'), { level: 'error' });
    }
  }

  public log(level: LogLevel, message: string, data?: LogData): void {
    this.logQueue.push({ level, message, data });

    if (this.logQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  public info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: LogData): void {
    this.log('error', message, data);
  }

  public debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
} 