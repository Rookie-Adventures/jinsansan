/**
 * 通知系统类型定义
 * @packageDocumentation
 */

import type { Severity } from '../../types/severity';

/**
 * 通知选项类型
 * @description 定义通知的配置选项
 */
export type NotificationOptions = {
  /** 通知类型 */
  type: Severity;
  /** 通知消息 */
  message: string;
  /** 通知描述 */
  description?: string;
  /** 通知持续时间（毫秒） */
  duration?: number;
};

// Re-export Severity type for convenience
export type { Severity as NotificationType };
