import { v4 as uuidv4 } from 'uuid';
import type { AlertRule, AlertConfig, AlertSeverity, PerformanceMetric } from './types';
import { sanitizeInput, validateEmail } from '@/utils/security';

export class AlertManager {
  private static instance: AlertManager;
  private config: AlertConfig = {
    enabled: true,
    rules: [],
    notification: {}
  };

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  // 加载配置
  private loadConfig(): void {
    const savedConfig = localStorage.getItem('alertConfig');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  // 保存配置
  private saveConfig(): void {
    localStorage.setItem('alertConfig', JSON.stringify(this.config));
  }

  // 添加规则
  addRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    // 验证规则数据
    this.validateRule(rule);

    const newRule: AlertRule = {
      ...rule,
      id: uuidv4(),
      name: sanitizeInput(rule.name) // 净化名称
    };
    this.config.rules.push(newRule);
    this.saveConfig();
    return newRule;
  }

  // 验证规则
  private validateRule(rule: Omit<AlertRule, 'id'>): void {
    if (!rule.name.trim()) {
      throw new Error('规则名称不能为空');
    }

    if (!['threshold', 'trend', 'anomaly'].includes(rule.type)) {
      throw new Error('无效的规则类型');
    }

    if (!['page_load', 'resource', 'long_task', 'interaction', 'custom', 'api_call'].includes(rule.metric)) {
      throw new Error('无效的监控指标');
    }

    if (!['>', '<', '>=', '<=', '==', '!='].includes(rule.condition.operator)) {
      throw new Error('无效的操作符');
    }

    if (isNaN(rule.condition.value) || rule.condition.value < 0) {
      throw new Error('无效的阈值');
    }

    if (!['info', 'warning', 'error', 'critical'].includes(rule.severity)) {
      throw new Error('无效的告警级别');
    }

    if (typeof rule.enabled !== 'boolean') {
      throw new Error('无效的启用状态');
    }

    // 验证邮箱格式
    if (rule.notification.email?.length) {
      const invalidEmails = rule.notification.email.filter(
        email => !validateEmail(email)
      );
      if (invalidEmails.length > 0) {
        throw new Error('无效的邮箱格式');
      }
    }
  }

  // 更新规则
  updateRule(rule: AlertRule): void {
    const index = this.config.rules.findIndex(r => r.id === rule.id);
    if (index !== -1) {
      this.config.rules[index] = rule;
      this.saveConfig();
    }
  }

  // 删除规则
  deleteRule(ruleId: string): void {
    this.config.rules = this.config.rules.filter(r => r.id !== ruleId);
    this.saveConfig();
  }

  // 启用/禁用规则
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.config.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.saveConfig();
    }
  }

  // 检查指标是否触发告警
  checkMetric(metric: PerformanceMetric): void {
    if (!this.config.enabled) return;

    this.config.rules
      .filter(rule => rule.enabled && rule.metric === metric.type)
      .forEach(rule => {
        const value = this.extractMetricValue(metric);
        if (this.evaluateCondition(rule.condition, value)) {
          this.triggerAlert(rule, metric);
        }
      });
  }

  // 提取指标值
  private extractMetricValue(metric: PerformanceMetric): number {
    switch (metric.type) {
      case 'page_load':
        return metric.data.loadEventEnd;
      case 'resource':
        return metric.data.duration;
      case 'long_task':
        return metric.data.duration;
      case 'interaction':
        return metric.data.duration;
      case 'custom':
        return metric.data.value;
      case 'api_call':
        return metric.data.duration;
      default:
        return 0;
    }
  }

  // 评估告警条件
  private evaluateCondition(
    condition: AlertRule['condition'],
    value: number
  ): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.value;
      case '<':
        return value < condition.value;
      case '>=':
        return value >= condition.value;
      case '<=':
        return value <= condition.value;
      case '==':
        return value === condition.value;
      case '!=':
        return value !== condition.value;
      default:
        return false;
    }
  }

  // 触发告警
  private async triggerAlert(rule: AlertRule, metric: PerformanceMetric): Promise<void> {
    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      metric: metric.type,
      value: this.extractMetricValue(metric),
      timestamp: Date.now()
    };

    // 发送告警通知
    await this.sendNotification(rule.severity, alert);

    // 记录告警历史
    this.logAlert(alert);
  }

  // 发送通知
  private async sendNotification(
    severity: AlertSeverity,
    alert: any
  ): Promise<void> {
    try {
      await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          severity,
          alert,
          notification: this.config.notification
        })
      });
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  // 记录告警历史
  private logAlert(alert: any): void {
    const alerts = JSON.parse(localStorage.getItem('alertHistory') || '[]');
    alerts.unshift(alert);
    // 只保留最近100条告警记录
    if (alerts.length > 100) {
      alerts.pop();
    }
    localStorage.setItem('alertHistory', JSON.stringify(alerts));
  }

  // 获取告警历史
  getAlertHistory(): any[] {
    return JSON.parse(localStorage.getItem('alertHistory') || '[]');
  }

  // 更新通知配置
  updateNotificationConfig(config: AlertConfig['notification']): void {
    this.config.notification = config;
    this.saveConfig();
  }

  // 获取当前配置
  getConfig(): AlertConfig {
    return { ...this.config };
  }
} 