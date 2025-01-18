import type { AxiosRequestConfig } from 'axios';
import type { ProgressInfo } from './progress-monitor';
import type { HttpConfig } from './config';
import type { ApiResponse } from '@/types/api';
import { HttpErrorType, type ErrorSeverity, type ErrorTrace, type ErrorMetadata } from './error/types';

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
 * @template T - 队列项ID的类型
 */
export interface BaseQueueItem<T> {
  /** 队列项的唯一标识符 */
  id: T;
  /** 队列项的优先级，数值越大优先级越高 */
  priority: number;
}

/**
 * HTTP请求队列项类型
 * @template T - 队列项ID的类型
 */
export interface HttpQueueItem<T = string> extends BaseQueueItem<T> {
  /** 创建时间戳 */
  timestamp: number;
  /** HTTP请求配置 */
  config: HttpRequestConfig;
}

/**
 * HTTP错误类
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