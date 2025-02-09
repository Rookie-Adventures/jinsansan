/**
 * 用户行为事件类型
 */
export enum UserEventType {
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
  FORM_SUBMIT = 'form_submit',
  ERROR = 'error',
  CUSTOM = 'custom'
}

/**
 * 用户行为事件接口
 */
export interface UserEvent {
  type: UserEventType;
  timestamp: number;
  data: Record<string, any>;
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
    beforeTrack: event => event
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
      referrer: document.referrer
    });
  }

  /**
   * 跟踪点击事件
   */
  public trackClick(elementId: string, elementType: string): void {
    this.track(UserEventType.CLICK, {
      elementId,
      elementType,
      path: window.location.pathname
    });
  }

  /**
   * 跟踪表单提交
   */
  public trackFormSubmit(formId: string, success: boolean): void {
    this.track(UserEventType.FORM_SUBMIT, {
      formId,
      success,
      path: window.location.pathname
    });
  }

  /**
   * 跟踪错误
   */
  public trackError(error: Error, context?: Record<string, any>): void {
    this.track(UserEventType.ERROR, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });
  }

  /**
   * 跟踪自定义事件
   */
  public trackCustomEvent(name: string, data: Record<string, any>): void {
    this.track(UserEventType.CUSTOM, {
      name,
      ...data
    });
  }

  /**
   * 跟踪事件
   */
  private track(type: UserEventType, data: Record<string, any>): void {
    // 检查采样率
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const event: UserEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId
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
   * 刷新事件队列
   */
  public async flush(): Promise<void> {
    if (this.events.length === 0 || this.isTracking) {
      return;
    }

    let currentBatch: UserEvent[] = [];
    
    try {
      this.isTracking = true;
      
      // 处理所有事件，每次处理 batchSize 个
      while (this.events.length > 0) {
        currentBatch = this.events.splice(0, this.config.batchSize);
        
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentBatch)
        });

        if (!response.ok) {
          throw new Error(`Analytics tracking failed: ${response.status}`);
        }
      }
    } catch (error) {
      // 如果发送失败，将事件放回队列
      this.events.unshift(...currentBatch);
      console.error('Analytics tracking failed:', error);
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