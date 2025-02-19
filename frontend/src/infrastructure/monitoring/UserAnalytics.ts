import { errorLogger } from '../../utils/error/errorLogger';

/**
 * 用户行为事件类型
 * 这些常量在 track() 方法中被用作事件类型标识符
 * @see trackPageView - 使用 PAGE_VIEW
 * @see trackClick - 使用 CLICK
 * @see trackFormSubmit - 使用 FORM_SUBMIT
 * @see trackError - 使用 ERROR
 * @see trackCustomEvent - 使用 CUSTOM
 */
export enum UserEventType {
  /** 页面访问事件 @see trackPageView */
  PAGE_VIEW = 'page_view',
  /** 点击事件 @see trackClick */
  CLICK = 'click',
  /** 表单提交事件 @see trackFormSubmit */
  FORM_SUBMIT = 'form_submit',
  /** 错误事件 @see trackError */
  ERROR = 'error',
  /** 自定义事件 @see trackCustomEvent */
  CUSTOM = 'custom',
}

/**
 * 分析数据值类型
 */
export type AnalyticsValue = string | number | boolean | null | undefined | {
  [key: string]: AnalyticsValue;
} | AnalyticsValue[];

/**
 * 分析数据记录类型
 */
export type AnalyticsData = Record<string, AnalyticsValue>;

/**
 * 用户行为事件接口
 */
export interface UserEvent {
  type: UserEventType;
  timestamp: number;
  data: AnalyticsData;
  sessionId: string;
  userId?: string;
}

/**
 * 用户分析配置接口
 */
export interface UserAnalyticsConfig {
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  sampleRate?: number;
  sessionTimeout?: number;
  beforeTrack?: (event: UserEvent) => UserEvent | false;
}

/**
 * 用户行为分析管理器
 */
export class UserAnalytics {
  private static instance: UserAnalytics | null = null;
  private events: UserEvent[] = [];
  private isTracking = false;
  private sessionId: string;
  private userId?: string;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private config: Required<UserAnalyticsConfig> = {
    endpoint: '/api/analytics',
    batchSize: 10,
    flushInterval: 5000,
    sampleRate: 1.0,
    sessionTimeout: 30 * 60 * 1000, // 30分钟
    beforeTrack: event => event,
  };

  private constructor(config?: UserAnalyticsConfig) {
    this.config = { ...this.config, ...config };
    this.sessionId = this.generateSessionId();
    if (process.env.NODE_ENV !== 'test') {
      this.startTracking();
    }
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: UserAnalyticsConfig): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics(config);
    } else if (config) {
      UserAnalytics.instance.updateConfig(config);
    }
    return UserAnalytics.instance;
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<UserAnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    if (process.env.NODE_ENV !== 'test') {
      this.restartTracking();
    }
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 跟踪页面访问
   */
  public trackPageView(path: string, title?: string): void {
    this.track(UserEventType.PAGE_VIEW, {
      path,
      title: title || document.title,
      referrer: document.referrer,
    });
  }

  /**
   * 跟踪点击事件
   */
  public trackClick(elementId: string, elementType: string): void {
    this.track(UserEventType.CLICK, {
      elementId,
      elementType,
      path: window.location.pathname,
    });
  }

  /**
   * 跟踪表单提交
   */
  public trackFormSubmit(formId: string, success: boolean): void {
    this.track(UserEventType.FORM_SUBMIT, {
      formId,
      success,
      path: window.location.pathname,
    });
  }

  /**
   * 跟踪错误
   */
  public trackError(error: Error, context?: AnalyticsData): void {
    this.track(UserEventType.ERROR, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * 跟踪自定义事件
   */
  public trackCustomEvent(name: string, data: AnalyticsData): void {
    this.track(UserEventType.CUSTOM, {
      name,
      ...data,
    });
  }

  /**
   * 跟踪事件
   */
  private track(type: UserEventType, data: AnalyticsData): void {
    // 检查采样率
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const event: UserEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // 应用前置处理
    const processedEvent = this.config.beforeTrack(event);
    if (processedEvent === false) {
      return;
    }

    this.events.push(processedEvent);

    // 在生产环境中，如果达到批处理大小，立即刷新
    if (process.env.NODE_ENV !== 'test' && this.events.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  /**
   * 发送单个批次的事件
   * @returns 是否发送成功
   */
  private async sendBatch(events: UserEvent[]): Promise<boolean> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
      });

      if (!response.ok) {
        throw new Error(`Analytics tracking failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Analytics tracking failed'), {
        level: 'error',
        context: { events },
      });
      return false;
    }
  }

  /**
   * 刷新事件队列
   */
  public async flush(): Promise<void> {
    if (this.events.length === 0 || this.isTracking) {
      return;
    }

    this.isTracking = true;

    try {
      // 获取当前批次
      const currentBatch = this.events.splice(0, this.config.batchSize);
      
      // 发送当前批次
      const success = await this.sendBatch(currentBatch);
      
      if (!success) {
        // 发送失败时，将事件放回队列头部并停止处理
        this.events.unshift(...currentBatch);
        this.isTracking = false;
        return;
      }

      // 只有在生产环境且成功发送且还有更多事件时，才继续处理
      if (process.env.NODE_ENV !== 'test' && this.events.length > 0) {
        this.isTracking = false;
        await this.flush();
      }
    } finally {
      this.isTracking = false;
    }
  }

  /**
   * 开始跟踪
   */
  private startTracking(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 重新开始跟踪
   */
  private restartTracking(): void {
    this.stopTracking();
    this.startTracking();
  }

  /**
   * 停止跟踪
   */
  public stopTracking(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * 清除所有事件
   */
  public clearEvents(): void {
    this.events = [];
  }

  /**
   * 获取当前事件队列
   */
  public getEvents(): UserEvent[] {
    return [...this.events];
  }

  /**
   * 重置实例（仅用于测试）
   */
  public static resetInstance(): void {
    if (UserAnalytics.instance) {
      UserAnalytics.instance.stopTracking();
      UserAnalytics.instance = null;
    }
  }
}
