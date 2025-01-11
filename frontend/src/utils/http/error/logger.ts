import type { HttpError } from '@/utils/http/error/types';

export interface ErrorLogData {
  type: string;
  message: string;
  timestamp: number;
  url?: string;
  method?: string;
  status?: number;
  data?: unknown;
  stack?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logQueue: ErrorLogData[] = [];
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 5000; // 5秒

  private constructor() {
    this.startAutoFlush();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  // 记录错误
  log(error: HttpError, context?: { url?: string; method?: string }): void {
    const logData: ErrorLogData = {
      type: error.type,
      message: error.message,
      timestamp: Date.now(),
      status: error.status,
      data: error.data,
      stack: error.stack,
      ...context
    };

    this.logQueue.push(logData);

    // 如果队列超过最大大小，立即刷新
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush();
    }

    // 对于严重错误，立即上报
    if (this.isCriticalError(error)) {
      this.flush();
    }
  }

  // 判断是否为严重错误
  private isCriticalError(error: HttpError): boolean {
    return error.status ? error.status >= 500 : false;
  }

  // 刷新日志队列
  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      await this.sendLogs(logs);
    } catch (error) {
      console.error('Failed to send error logs:', error);
      // 失败时，将日志添加回队列
      this.logQueue.unshift(...logs);
    }
  }

  // 发送日志到服务器
  private async sendLogs(logs: ErrorLogData[]): Promise<void> {
    // TODO: 替换为实际的日志服务器地址
    const url = '/api/logs/error';
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logs),
    });
  }

  // 开始自动刷新
  private startAutoFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // 停止自动刷新
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
} 