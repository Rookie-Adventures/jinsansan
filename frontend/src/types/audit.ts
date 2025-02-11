/**
 * 审计日志类型枚举
 */
export enum AuditLogType {
  AUTH = 'auth',
  ACCESS = 'access',
  DATA = 'data',
  SECURITY = 'security',
  SYSTEM = 'system',
}

/**
 * 审计日志级别枚举
 */
export enum AuditLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  /** 唯一标识符 */
  id: string;
  /** 时间戳 */
  timestamp: number;
  /** 日志类型 */
  type: AuditLogType;
  /** 日志级别 */
  level: AuditLogLevel;
  /** 用户ID（可选） */
  userId?: string;
  /** 操作行为 */
  action: string;
  /** 操作资源 */
  resource: string;
  /** 详细信息 */
  details: Record<string, unknown>;
  /** IP地址（可选） */
  ip?: string;
  /** 用户代理（可选） */
  userAgent?: string;
  /** 操作状态 */
  status: 'success' | 'failure';
  /** 错误信息（可选） */
  errorMessage?: string;
  /** 其他可能的字段 */
  [key: string]: unknown;
}

/**
 * 告警数据接口
 */
export interface AlertData {
  /** 告警类型 */
  type: AuditLogType;
  /** 告警级别 */
  level: AuditLogLevel;
  /** 操作行为 */
  action: string;
  /** 操作资源 */
  resource: string;
  /** ISO格式时间戳 */
  timestamp: string;
  /** 详细信息 */
  details: Record<string, unknown>;
  /** 操作状态 */
  status: string;
  /** 错误信息（可选） */
  errorMessage?: string;
  /** 其他可能的字段 */
  [key: string]: unknown;
} 