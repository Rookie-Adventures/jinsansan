import { errorLogger } from '@/utils/error/errorLogger';

import { encryptionManager } from './encryption';

/**
 * 审计日志类型
 */
export enum AuditLogType {
  AUTH = 'auth',
  ACCESS = 'access',
  DATA = 'data',
  SECURITY = 'security',
  SYSTEM = 'system',
}

/**
 * 审计日志级别
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
interface AuditLog {
  id: string;
  timestamp: number;
  type: AuditLogType;
  level: AuditLogLevel;
  userId?: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  [key: string]: unknown; // 添加索引签名
}

/**
 * 告警数据接口
 */
interface AlertData {
  type: AuditLogType;
  level: AuditLogLevel;
  action: string;
  resource: string;
  timestamp: string;
  details: Record<string, unknown>;
  status: string;
  errorMessage?: string;
  [key: string]: unknown; // 添加索引签名
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
    level: AuditLogLevel,
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

      // 添加日志到内存
      this.addLog(log);

      // 发送到服务器
      await this.sendToServer(log);

      // 检查是否需要触发告警
      if (level === AuditLogLevel.ERROR || level === AuditLogLevel.CRITICAL) {
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
        level: 'error',
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
        level: 'error',
        context: alertData,
      });
    } catch (error) {
      errorLogger.log(error instanceof Error ? error : new Error('Failed to trigger alert'), {
        level: 'error',
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
  getLogsByLevel(level: AuditLogLevel): AuditLog[] {
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
      level: 'error',
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
