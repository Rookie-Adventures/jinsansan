import { HttpError } from './error';
import { ErrorMetadata, ErrorTrace } from './types';

interface ErrorReportData {
  error: {
    name: string;
    message: string;
    stack?: string;
    type: string;
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
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private queue: ErrorReportData[] = [];
  private options: Required<ErrorReporterOptions>;
  private isReporting = false;

  private readonly defaultOptions: Required<ErrorReporterOptions> = {
    endpoint: '/api/error-report',
    sampleRate: 1.0,
    beforeReport: data => data,
    maxQueueSize: 100
  };

  private constructor(options?: ErrorReporterOptions) {
    this.options = { ...this.defaultOptions, ...options };
  }

  static getInstance(options?: ErrorReporterOptions): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter(options);
    }
    return ErrorReporter.instance;
  }

  report(error: HttpError): void {
    // 根据采样率决定是否上报
    if (Math.random() > this.options.sampleRate) {
      return;
    }

    const reportData: ErrorReportData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: error.type
      },
      trace: error.trace,
      metadata: error.metadata,
      environment: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href
      }
    };

    // 调用beforeReport钩子
    const processedData = this.options.beforeReport(reportData);
    if (processedData === false) {
      return;
    }

    this.addToQueue(processedData);
    this.processQueue();
  }

  private addToQueue(data: ErrorReportData): void {
    if (this.queue.length >= this.options.maxQueueSize) {
      this.queue.shift(); // 移除最早的错误报告
    }
    this.queue.push(data);
  }

  private async processQueue(): Promise<void> {
    if (this.isReporting || this.queue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, 10); // 每次处理10条
        await this.sendErrorReport(batch);
      }
    } finally {
      this.isReporting = false;
    }
  }

  private async sendErrorReport(data: ErrorReportData | ErrorReportData[]): Promise<void> {
    try {
      const response = await fetch(this.options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send error report:', error);
      // 如果发送失败，将数据重新加入队列
      if (Array.isArray(data)) {
        this.queue.unshift(...data);
      } else {
        this.queue.unshift(data);
      }
    }
  }
} 