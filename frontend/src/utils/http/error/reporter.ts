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
  maxRetries?: number;
  initialRetryDelay?: number;
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private queue: Array<{
    data: ErrorReportData;
    retries: number;
    nextRetry?: number;
  }> = [];
  private options: Required<ErrorReporterOptions>;
  private isReporting = false;

  private readonly defaultOptions: Required<ErrorReporterOptions> = {
    endpoint: '/api/error-report',
    sampleRate: 1.0,
    beforeReport: data => data,
    maxQueueSize: 100,
    maxRetries: 3,
    initialRetryDelay: 1000
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
      // 移除最早的且重试次数最多的错误报告
      const index = this.queue.findIndex(item => 
        item.retries >= this.options.maxRetries
      );
      if (index !== -1) {
        this.queue.splice(index, 1);
      } else {
        this.queue.shift();
      }
    }
    
    this.queue.push({
      data,
      retries: 0,
      nextRetry: Date.now()
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isReporting || this.queue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const now = Date.now();
      const readyItems = this.queue.filter(item => 
        !item.nextRetry || item.nextRetry <= now
      );

      if (readyItems.length === 0) {
        this.isReporting = false;
        return;
      }

      const batch = readyItems.splice(0, 10);
      const batchData = batch.map(item => item.data);
      
      try {
        await this.sendErrorReport(batchData);
        // 发送成功，从队列中移除
        this.queue = this.queue.filter(item => 
          !batch.includes(item)
        );
      } catch (error) {
        // 更新重试信息
        batch.forEach(item => {
          if (item.retries < this.options.maxRetries) {
            item.retries++;
            // 使用指数退避策略
            const delay = this.options.initialRetryDelay * Math.pow(2, item.retries - 1);
            item.nextRetry = Date.now() + Math.min(delay, 30000); // 最大延迟30秒
          }
        });
        
        // 重新加入未达到最大重试次数的项
        const retriableItems = batch.filter(item => 
          item.retries < this.options.maxRetries
        );
        if (retriableItems.length > 0) {
          this.queue.unshift(...retriableItems);
        }
      }
    } finally {
      this.isReporting = false;
      // 如果队列中还有项目，继续处理
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  private async sendErrorReport(data: ErrorReportData[]): Promise<void> {
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
  }
} 