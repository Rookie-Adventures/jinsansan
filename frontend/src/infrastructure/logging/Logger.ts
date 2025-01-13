import { LogLevel, LogEntry } from './types.ts';

export class Logger {
  private static instance: Logger;
  private logQueue: Array<{ level: LogLevel; message: string; data?: any }> = [];
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
              console.debug(message, data);
              break;
            case 'info':
              console.info(message, data);
              break;
            case 'warn':
              console.warn(message, data);
              break;
            case 'error':
              console.error(message, data);
              break;
          }
        });
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  public log(level: LogLevel, message: string, data?: any): void {
    this.logQueue.push({ level, message, data });

    // 如果队列超过最大大小，立即刷新
    if (this.logQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
} 