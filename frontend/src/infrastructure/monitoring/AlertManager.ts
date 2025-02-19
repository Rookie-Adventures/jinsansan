import type { Alert, AlertNotification, AlertRule } from './types';

import { errorLogger } from '../../utils/errorLogger';


/**
 * 告警管理器
 * 负责告警规则的管理、告警状态的维护和告警通知的分发
 */
export class AlertManager {
  private static instance: AlertManager;
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  /** 通知处理器列表，每个处理器接收 AlertNotification 对象并进行相应处理 */
  private notificationHandlers: ((notification: AlertNotification) => void)[] = [];
  private historyLimit: number = 1000;
  private metricTimestamps: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  public addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  public updateRule(rule: AlertRule): void {
    if (this.rules.has(rule.id)) {
      this.rules.set(rule.id, rule);
    }
  }

  public deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
    // Clean up related data
    this.metricTimestamps.delete(ruleId);
    // Remove active alerts for this rule
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.ruleId === ruleId) {
        this.activeAlerts.delete(alertId);
      }
    }
  }

  public getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  public getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  public evaluateMetric(metric: string, value: number, timestamp: number): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.metric !== metric) continue;
      this.evaluateRule(rule, value, timestamp);
    }
  }

  private evaluateRule(rule: AlertRule, value: number, timestamp: number): void {
    const isThresholdExceeded = this.checkThreshold(rule, value);
    const ruleKey = rule.id;

    if (isThresholdExceeded) {
      // Get or initialize timestamp array for this rule
      const timestamps = this.metricTimestamps.get(ruleKey) || [];
      timestamps.push(timestamp);

      // Keep only timestamps within the duration window
      const durationWindow = timestamp - 300000; // 5 minutes default duration
      const recentTimestamps = timestamps.filter(t => t >= durationWindow);
      this.metricTimestamps.set(ruleKey, recentTimestamps);

      // Check if we have enough consecutive readings within the duration window
      if (recentTimestamps.length >= 5) {
        // At least 5 readings
        const timeDiff = recentTimestamps[recentTimestamps.length - 1] - recentTimestamps[0];
        if (timeDiff >= 240000 && timeDiff <= 360000) {
          // Between 4-6 minutes to allow for some timing variance
          // Create or update alert
          const alertId = `${rule.id}-${recentTimestamps[0]}`;
          if (!this.activeAlerts.has(alertId)) {
            const alert: Alert = {
              id: alertId,
              ruleId: rule.id,
              value,
              timestamp: timestamp,
              message: `${rule.metric} exceeded threshold: ${value} ${rule.condition.operator} ${rule.condition.value}`,
              startTime: recentTimestamps[0],
              status: 'active',
            };
            this.activeAlerts.set(alertId, alert);
            this.notifyAlert('trigger', rule, value, timestamp);
          }
        }
      }
    } else {
      // Clear timestamps for this rule
      this.metricTimestamps.delete(ruleKey);

      // Resolve active alerts for this rule
      for (const [alertId, alert] of this.activeAlerts.entries()) {
        if (alert.ruleId === rule.id) {
          const resolvedAlert: Alert = {
            ...alert,
            status: 'resolved',
            endTime: timestamp,
          };
          this.alertHistory.push(resolvedAlert);
          this.activeAlerts.delete(alertId);
          this.notifyAlert('resolve', rule, value, timestamp);
          this.trimHistory();
        }
      }
    }
  }

  private checkThreshold(rule: AlertRule, value: number): boolean {
    const { operator, value: conditionValue } = rule.condition;

    switch (operator) {
      case '>':
        return value > conditionValue;
      case '<':
        return value < conditionValue;
      case '>=':
        return value >= conditionValue;
      case '<=':
        return value <= conditionValue;
      case '==':
        return value === conditionValue;
      case '!=':
        return value !== conditionValue;
      default:
        return false;
    }
  }

  private trimHistory(): void {
    if (this.alertHistory.length > this.historyLimit) {
      this.alertHistory = this.alertHistory.slice(-this.historyLimit);
    }
  }

  public setHistoryLimit(limit: number): void {
    this.historyLimit = limit;
    this.trimHistory();
  }

  /**
   * 设置告警通知处理器
   * @param handler 通知处理器函数，接收 AlertNotification 对象作为参数
   * notification 包含：
   * - type: 通知类型（触发/解除）
   * - rule: 触发告警的规则
   * - value: 告警值
   * - timestamp: 时间戳
   * - config: 通知配置（邮件/webhook/slack）
   * - message: 告警消息
   * - details: 可选的告警详情
   */
  public setNotificationHandler(handler: (notification: AlertNotification) => void): void {
    // 设置单个通知处理器,替换所有现有处理器
    this.notificationHandlers = [handler];
  }

  /**
   * 添加告警通知处理器
   * @param handler 通知处理器函数，接收 AlertNotification 对象作为参数
   * notification 对象包含告警的完整信息，用于实现不同的通知方式
   */
  public addNotificationHandler(handler: (notification: AlertNotification) => void): void {
    // 添加新的通知处理器到处理器列表
    this.notificationHandlers.push(handler);
  }

  /**
   * 移除指定的告警通知处理器
   * @param handler 要移除的通知处理器函数
   */
  public removeNotificationHandler(handler: (notification: AlertNotification) => void): void {
    // 从处理器列表中移除指定的处理器
    this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
  }

  /**
   * 发送告警通知
   * @param type 通知类型（触发/解除）
   * @param rule 触发告警的规则
   * @param value 告警值
   * @param timestamp 时间戳
   */
  private notifyAlert(
    type: 'trigger' | 'resolve',
    rule: AlertRule,
    value: number,
    timestamp: number
  ): void {
    // 构造告警通知对象
    const notification: AlertNotification = {
      type,
      rule,
      value,
      timestamp,
      config: rule.notification,
      message: `${rule.metric} ${type === 'trigger' ? 'exceeded' : 'returned to normal'} threshold: ${value} ${rule.condition.operator} ${rule.condition.value}`,
    };
    
    // 分发通知到所有处理器
    if (this.notificationHandlers.length > 0) {
      this.notificationHandlers.forEach(handler => {
        try {
          handler(notification);
        } catch (error) {
          errorLogger.log(
            error instanceof Error ? error : new Error('Error in notification handler'),
            { level: 'error' }
          );
        }
      });
    }
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  public getAlertHistory(): Alert[] {
    return [...this.alertHistory];
  }

  // For testing purposes
  public clearState(): void {
    this.rules.clear();
    this.activeAlerts.clear();
    this.alertHistory = [];
    this.metricTimestamps.clear();
    this.notificationHandlers = [];
  }
}
