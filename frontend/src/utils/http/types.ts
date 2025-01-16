import type { AxiosRequestConfig } from 'axios';
import type { ProgressInfo } from './progress-monitor';
import type { HttpConfig } from './config';
import type { HttpError } from './error/types';
import type { ApiResponse, HttpRequestConfig } from '@/types/api';

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

export type { HttpError, ApiResponse, HttpRequestConfig }; 