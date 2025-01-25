import type { AxiosRequestConfig } from 'axios';
import { HttpErrorType, type ErrorMetadata, type ErrorSeverity, type ErrorTrace } from './error/types';

/**
 * HTTP请求配置扩展
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /** 缓存配置 */
  cache?: {
    /** 是否启用缓存 */
    enable: boolean;
    /** 缓存过期时间（毫秒） */
    ttl: number;
    /** 自定义缓存键 */
    key?: string;
  };
  /** 队列配置 */
  queue?: {
    /** 是否启用队列 */
    enable: boolean;
    /** 优先级，数值越大优先级越高 */
    priority: number;
  };
  /** 取消令牌ID */
  cancelTokenId?: string;
  /** 是否需要认证 */
  requiresAuth?: boolean;
  /** 缓存时间（毫秒） */
  cacheTTL?: number;
}

/**
 * 缓存数据类型
 */
export interface CacheData<T = unknown> {
  /** 缓存的数据 */
  data: T;
  /** 缓存时间戳 */
  timestamp: number;
  /** 缓存过期时间（毫秒） */
  ttl: number;
}

/**
 * 性能统计数据
 */
export interface PerformanceStats {
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 成功率 */
  successRate: number;
  /** 总请求数 */
  totalRequests: number;
  /** 成功请求数 */
  successfulRequests: number;
  /** 失败请求数 */
  failedRequests: number;
  /** 总响应时间 */
  totalResponseTime: number;
}

/**
 * 错误统计数据
 */
export type ErrorStats = Record<HttpErrorType, number>;

/**
 * 请求管理器接口
 */
export interface RequestManager {
  /** 缓存存储 */
  cache: Map<string, CacheData>;
  /** 生成缓存键 */
  generateCacheKey: (config: HttpRequestConfig) => string;
  /** 获取缓存数据 */
  getCacheData: <T>(key: string) => T | null;
  /** 设置缓存数据 */
  setCacheData: <T>(key: string, data: T, ttl: number) => void;
  /** 清空待处理请求 */
  clearPendingRequests: () => void;
  /** 添加待处理请求 */
  addPendingRequest: (requestId: string, config: HttpRequestConfig, cancelFn?: () => void) => void;
  /** 检查是否有待处理请求 */
  hasPendingRequest: (requestId: string) => boolean;
  /** 移除待处理请求 */
  removePendingRequest: (requestId: string) => void;
  /** 取消重复请求 */
  cancelDuplicateRequest: (requestId: string) => void;
  /** 设置最大并发请求数 */
  setMaxConcurrentRequests: (max: number) => void;
  /** 获取请求槽位 */
  acquireRequestSlot: (requestId: string, config: HttpRequestConfig) => Promise<boolean>;
  /** 释放请求槽位 */
  releaseRequestSlot: (requestId: string) => void;
  /** 记录错误 */
  recordError: (error: { type: HttpErrorType; message: string; status: number }) => void;
  /** 获取错误统计 */
  getErrorStats: () => ErrorStats;
  /** 重置错误统计 */
  resetErrorStats: () => void;
  /** 记录请求开始 */
  recordRequestStart: (requestId: string) => void;
  /** 记录请求结束 */
  recordRequestEnd: (requestId: string) => void;
  /** 记录请求完成 */
  recordRequestComplete: (success: boolean) => void;
  /** 获取性能统计 */
  getPerformanceStats: () => PerformanceStats;
  /** 添加请求到队列 */
  addToQueue: (
    config: HttpRequestConfig,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void
  ) => void;
}

/**
 * 队列项类型
 */
export interface QueueItem {
  /** 请求配置 */
  config: HttpRequestConfig;
  /** 成功回调 */
  resolve: (value: unknown) => void;
  /** 失败回调 */
  reject: (reason?: unknown) => void;
  /** 优先级 */
  priority: number;
}

/**
 * 基础队列项类型
 */
export interface BaseQueueItem<T> {
  /** 队列项的唯一标识符 */
  id: T;
  /** 队列项的优先级，数值越大优先级越高 */
  priority: number;
}

/**
 * HTTP队列项类型
 */
export interface HttpQueueItem<T = string> extends BaseQueueItem<T> {
  /** 创建时间戳 */
  timestamp: number;
  /** HTTP请求配置 */
  config: HttpRequestConfig;
}

/**
 * HTTP错误类型
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
    public type: HttpErrorType = HttpErrorType.UNKNOWN,
    public code?: string | number,
    public data?: unknown,
    public trace?: ErrorTrace,
    public recoverable?: boolean,
    public retryCount?: number,
    public severity?: ErrorSeverity,
    public metadata?: ErrorMetadata
  ) {
    super(message);
    this.name = 'HttpError';
  }
} 