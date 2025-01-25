import { HttpError } from './error';
import { ErrorMetadata, ErrorTrace } from './types';

interface ErrorReportData {
  error: {
    name: string;
    message: string;
    stack?: string;
    type: string;
    status: number | undefined;
    code: string | number | undefined;
    severity: string;
  };
  trace?: ErrorTrace;
  metadata?: ErrorMetadata;
  environment: {
    userAgent: string;
    timestamp: number;
    url: string;
  };
}

interface ErrorReporterOptions {
  endpoint?: string;
  sampleRate?: number;
  beforeReport?: (data: ErrorReportData) => ErrorReportData | false;
  maxQueueSize?: number;
  maxRetries?: number;
  initialRetryDelay?: number;
  batchSize?: number;
  flushInterval?: number;
}

export class ErrorReporter {
  private static instance: ErrorReporter | null = null;
  private queue: Array<ErrorReportData> = [];
  private options: Required<ErrorReporterOptions>;
  private isReporting = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private readonly defaultOptions: Required<ErrorReporterOptions> = {
    endpoint: '/api/error-report',
    sampleRate: 1.0,
    beforeReport: data => data,
    maxQueueSize: 100,
    maxRetries: 3,
    initialRetryDelay: 1000,
    batchSize: 10,
    flushInterval: 5000
  };

  private constructor(options?: ErrorReporterOptions) {
    this.options = { ...this.defaultOptions, ...options };
    // 在测试环境中禁用定时器
    if (process.env.NODE_ENV !== 'test') {
      this.startFlushTimer();
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // 只在 flushInterval > 0 时启动定时器
    if (this.options.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        void this.processQueue();
      }, this.options.flushInterval);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  static resetInstance(): void {
    if (ErrorReporter.instance) {
      ErrorReporter.instance.destroy();
      ErrorReporter.instance = null;
    }
  }

  static getInstance(options?: ErrorReporterOptions): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter(options);
    } else if (options) {
      // 更新选项
      ErrorReporter.instance.options = { ...ErrorReporter.instance.options, ...options };
      // 在非测试环境下重启定时器
      if (process.env.NODE_ENV !== 'test') {
        ErrorReporter.instance.startFlushTimer();
      }
    }
    return ErrorReporter.instance;
  }

  public async report(error: HttpError): Promise<void> {
    // 检查采样率
    if (this.options.sampleRate < Math.random()) {
      return;
    }

    const errorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: error.type,
        status: error.status,
        code: error.code,
        severity: error.severity
      },
      trace: error.trace,
      metadata: error.metadata,
      environment: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href
      }
    };

    // 应用前置处理
    if (this.options.beforeReport) {
      const processedReport = this.options.beforeReport(errorReport);
      if (processedReport === false) {
        return;
      }
    }

    this.queue.push(errorReport);
    
    // 在测试环境中立即处理队列
    if (process.env.NODE_ENV === 'test') {
      await this.processQueue();
    } else if (this.queue.length >= this.options.batchSize) {
      // 在生产环境中，如果队列达到批处理大小，立即处理
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isReporting) return;

    try {
      this.isReporting = true;
      const batch = this.queue.splice(0, this.options.batchSize);
      
      const response = await fetch(this.options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }
    } catch (error) {
      // 处理失败时，将未处理的错误报告重新加入队列
      this.queue.unshift(...this.queue.splice(0, this.options.batchSize));
      console.error('Error reporting failed:', error);
    } finally {
      this.isReporting = false;
      
      // 如果队列中还有未处理的错误，继续处理
      if (this.queue.length > 0 && process.env.NODE_ENV === 'test') {
        await this.processQueue();
      }
    }
  }

  public async flushNow(): Promise<void> {
    await this.processQueue();
  }
} 