/**
 * HTTP 相关类型定义
 * @packageDocumentation
 */

import type { AxiosRequestConfig } from 'axios';

import type { Severity } from '../../types/severity';

import type { HttpError } from './error/types';

/**
 * HTTP 请求配置类型
 * @description 扩展 Axios 请求配置，添加自定义配置选项
 */
export type HttpRequestConfig = AxiosRequestConfig & {
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
};

/**
 * HTTP 请求方法类型
 * @description 定义了 HTTP 请求的基本接口
 */
export type RequestMethod = {
  /**
   * GET 请求
   * @param url - 请求地址
   * @param config - 请求配置
   */
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;

  /**
   * POST 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   */
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;

  /**
   * PUT 请求
   * @param url - 请求地址
   * @param data - 请求数据
   * @param config - 请求配置
   */
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;

  /**
   * DELETE 请求
   * @param url - 请求地址
   * @param config - 请求配置
   */
  delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
};

// Re-export HttpError type from error/types
export type { HttpError };

// Re-export Severity type for HTTP error handling
export type { Severity };
