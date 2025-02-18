import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import { Severity } from '../../types/severity';

/**
 * HTTP 请求配置接口
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /** 是否启用重试机制 */
  retry?: boolean;
  /** 重试次数 */
  retryTimes?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 是否显示进度条 */
  withProgress?: boolean;
  /** 缓存配置 */
  cache?: {
    /** 是否启用缓存 */
    enable?: boolean;
    /** 缓存键 */
    key?: string;
    /** 缓存时间（毫秒） */
    ttl?: number;
  };
  /** 请求队列配置 */
  queue?: {
    /** 是否加入队列 */
    enable: boolean;
    /** 优先级（数字越大优先级越高） */
    priority: number;
  };
}

/**
 * 抽象请求方法类
 * 定义了 HTTP 请求的基本接口
 */
export abstract class RequestMethod {
  /**
   * GET 请求
   * @param url - 请求地址
   * @param config - 请求配置
   */
  abstract get<T>(url: string, config?: HttpRequestConfig): Promise<T>;

  /**
   * POST 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   */
  abstract post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;

  /**
   * PUT 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   */
  abstract put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;

  /**
   * DELETE 请求
   * @param url - 请求地址
   * @param config - 请求配置
   */
  abstract delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}

/**
 * 错误严重程度枚举
 * @description 统一的错误级别定义，用于整个应用的错误处理系统
 * @remarks
 * - INFO: 信息级别，用于展示提示信息
 * - WARNING: 警告级别，用于展示警告信息
 * - ERROR: 错误级别，用于展示错误信息
 * - CRITICAL: 严重错误级别，用于展示严重错误信息
 * @example
 * ```typescript
 * const error: HttpError = {
 *   severity: ErrorSeverity.ERROR,
 *   message: '请求失败'
 * };
 * ```
 */
export enum ErrorSeverity {
  /** 信息级别 - 用于展示提示信息 */
  INFO = 'info',
  /** 警告级别 - 用于展示警告信息 */
  WARNING = 'warning',
  /** 错误级别 - 用于展示错误信息 */
  ERROR = 'error',
  /** 严重错误级别 - 用于展示严重错误信息 */
  CRITICAL = 'critical',
}

/**
 * HTTP 错误接口
 * @description 扩展了标准 Error 接口，添加了 HTTP 相关的错误信息
 */
export interface HttpError extends Error {
  /** HTTP 状态码 */
  status?: number;
  /** 错误代码 */
  code?: string;
  /** 错误严重程度 */
  severity?: Severity;
  /** 是否为 Axios 错误 */
  isAxiosError?: boolean;
  /** 原始响应对象 */
  response?: AxiosResponse;
}
