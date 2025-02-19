/**
 * 审计日志相关类型和实现
 * @packageDocumentation
 */

import type { Severity } from '../../types/severity';

import { errorLogger } from '@/utils/error/errorLogger';

import { SeverityLevel } from '../../types/severity';

import { encryptionManager } from './encryption';


/**
 * 审计日志级别类型
 * @description 基于 Severity 的审计日志级别
 * @remarks
 * 这是一个类型别名，用于在审计日志上下文中提供更具语义化的类型名称。
 * 虽然底层使用的是 Severity 类型，但这个别名帮助我们：
 * 1. 在审计日志相关代码中提供更清晰的语义
 * 2. 保持与现有代码和文档的兼容性
 * 3. 为将来可能的审计日志级别扩展提供灵活性
 */
export type AuditLogLevel = Severity;

/**
 * 审计日志级别常量
 * @description 提供类型安全的审计日志级别值
 */
export const AuditLogLevels = SeverityLevel;

/**
 * 审计日志类型
 */
export enum AuditLogType {
  SECURITY = 'security',
  OPERATION = 'operation',
  SYSTEM = 'system'
}

/**
 * 审计日志基础接口
 */
interface BaseAuditData {
  type: AuditLogType;
  level: Severity;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  status: 'success' | 'failure';
  errorMessage?: string;
  [key: string]: unknown;
}

/**
 * 审计日志接口
 */
interface AuditLog extends BaseAuditData {
  id: string;
  timestamp: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * 告警数据接口
 */
interface AlertData extends BaseAuditData {
  timestamp: string;
}

/**
 * 审计日志管理器
 */
export class AuditLogManager {
  private static instance: AuditLogManager;
  private logs: AuditLog[] = [];
  private readonly maxLogsInMemory = 1000;
  private readonly encryptionKey = 'your-encryption-key'; // 实际应用中应该从安全的配置中获取
  private readonly apiBaseUrl =
    process.env.NODE_ENV === 'test' ? 'http://localhost:3000' : window.location.origin; // 在实际环境中使用当前域名

  private constructor() {}

  static getInstance(): AuditLogManager {
    if (!AuditLogManager.instance) {
      AuditLogManager.instance = new AuditLogManager();
    }
    return AuditLogManager.instance;
  }

  /**
   * 记录审计日志
   */
  async log(
    type: AuditLogType,
    level: Severity,
    action: string,
    resource: string,
    details: Record<string, unknown>,
    status: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): Promise<void> {
    try {
      const log: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type,
        level,
        userId: this.getCurrentUserId(),
        action,
        resource,
        details,
        ip: this.getClientIP(),
        userAgent: navigator.userAgent,
        status,
        errorMessage,
      };

      this.addLog(log);
      await this.sendToServer(log);

      if (level === SeverityLevel.ERROR || level === SeverityLevel.CRITICAL) {
        this.triggerAlert(log);
      }
    } catch (error) {
      await this.handleError(
        error instanceof Error ? error : new Error('Failed to process audit log'),
        {
          type,
          level,
          action,
          resource,
        }
      );
    }
  }

  /**
   * 添加日志到内存
   */
  private addLog(log: AuditLog): void {
    this.logs.push(log);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift(); // 移除最旧的日志
    }
  }

  /**
   * 加密敏感数据
   */
  private encryptSensitiveData(log: AuditLog): AuditLog {
    const sensitiveFields = ['userId', 'ip'];
    const encryptedLog = { ...log };

    sensitiveFields.forEach(field => {
      if (encryptedLog[field]) {
        encryptedLog[field] = encryptionManager.encrypt(
          String(encryptedLog[field]),
          this.encryptionKey
        );
      }
    });

    return encryptedLog;
  }

  /**
   * 发送日志到服务器
   */
  private async sendToServer(log: AuditLog): Promise<void> {
    try {
      const url = `${this.apiBaseUrl}/api/audit-logs`;
      const encryptedLog = this.encryptSensitiveData(log);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptedLog),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      this.storeFailedLog(log);
      throw error;
    }
  }

  /**
   * 存储发送失败的日志
   */
  private storeFailedLog(log: AuditLog): void {
    try {
      const storedLogs = localStorage.getItem('failedAuditLogs');
      const failedLogs = storedLogs ? (JSON.parse(storedLogs) as AuditLog[]) : [];
      failedLogs.push(log);
      localStorage.setItem('failedAuditLogs', JSON.stringify(failedLogs));
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Failed to store failed log'), {
        level: SeverityLevel.ERROR,
        context: { log },
      });
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(log: AuditLog): void {
    try {
      const alertData: AlertData = {
        type: log.type,
        level: log.level,
        action: log.action,
        resource: log.resource,
        timestamp: new Date(log.timestamp).toISOString(),
        details: log.details,
        status: log.status,
        errorMessage: log.errorMessage,
      };

      errorLogger.log(new Error(`Security Alert: ${log.action} on ${log.resource}`), {
        level: SeverityLevel.ERROR,
        context: alertData,
      });
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Failed to trigger alert'), {
        level: SeverityLevel.ERROR,
        context: { log },
      });
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | undefined {
    // 实际应用中应该从用户会话或状态管理中获取
    return undefined;
  }

  /**
   * 获取客户端IP
   */
  private getClientIP(): string | undefined {
    // 实际应用中可能需要通过服务器获取
    return undefined;
  }

  /**
   * 获取指定时间范围内的日志
   */
  getLogs(startTime: number, endTime: number): AuditLog[] {
    return this.logs
      .filter(log => log.timestamp >= startTime && log.timestamp <= endTime)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取指定类型的日志
   */
  getLogsByType(type: AuditLogType): AuditLog[] {
    return this.logs.filter(log => log.type === type).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取指定级别的日志
   */
  getLogsByLevel(level: Severity): AuditLog[] {
    return this.logs.filter(log => log.level === level).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 清除过期日志
   */
  clearOldLogs(maxAge: number): void {
    const cutoffTime = Date.now() - maxAge;
    this.logs = this.logs.filter(log => log.timestamp >= cutoffTime);
  }

  private async handleError(error: Error, context: Record<string, unknown>): Promise<void> {
    errorLogger.log(error, {
      level: SeverityLevel.ERROR,
      context: {
        ...context,
        timestamp: Date.now(),
        source: 'AuditLogger',
      },
    });
  }
}

// 导出单例实例
export const auditLogManager = AuditLogManager.getInstance();
