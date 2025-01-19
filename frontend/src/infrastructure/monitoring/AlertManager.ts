import { errorLogger } from '../../utils/errorLogger';
import type { Alert, AlertNotification, AlertRule } from './types';

export class AlertManager {
  private static instance: AlertManager;
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
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
    this.rules.set(rule.id, rule);
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
      if (recentTimestamps.length >= 5) { // At least 5 readings
        const timeDiff = recentTimestamps[recentTimestamps.length - 1] - recentTimestamps[0];
        if (timeDiff >= 240000 && timeDiff <= 360000) { // Between 4-6 minutes to allow for some timing variance
          // Create or update alert
          const alertId = `${rule.id}-${recentTimestamps[0]}`;
          if (!this.activeAlerts.has(alertId)) {
            const alert: Alert = {
              id: alertId,
              ruleId: rule.id,
              value,
              startTime: recentTimestamps[0],
              status: 'active'
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
            endTime: timestamp
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
    switch (rule.condition.operator) {
      case '>':
        return value > rule.condition.value;
      case '<':
        return value < rule.condition.value;
      case '>=':
        return value >= rule.condition.value;
      case '<=':
        return value <= rule.condition.value;
      case '==':
        return value === rule.condition.value;
      case '!=':
        return value !== rule.condition.value;
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

  public setNotificationHandler(handler: (notification: AlertNotification) => void): void {
    this.notificationHandlers = [handler];
  }

  public addNotificationHandler(handler: (notification: AlertNotification) => void): void {
    this.notificationHandlers.push(handler);
  }

  public removeNotificationHandler(handler: (notification: AlertNotification) => void): void {
    this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
  }

  private notifyAlert(type: 'trigger' | 'resolve', rule: AlertRule, value: number, timestamp: number): void {
    const notification: AlertNotification = {
      type,
      rule,
      value,
      timestamp
    };
    if (this.notificationHandlers.length > 0) {
      this.notificationHandlers.forEach(handler => {
        try {
          handler(notification);
        } catch (error) {
          errorLogger.log(error instanceof Error ? error : new Error('Error in notification handler'), { level: 'error' });
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