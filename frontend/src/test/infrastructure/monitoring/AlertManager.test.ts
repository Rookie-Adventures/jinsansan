import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertManager } from '@/infrastructure/monitoring/AlertManager';
import type { AlertRule, AlertSeverity } from '@/infrastructure/monitoring/types';

describe('AlertManager', () => {
  let alertManager: AlertManager;
  
  const mockRule: AlertRule = {
    id: '1',
    name: 'High CPU Usage',
    type: 'threshold',
    metric: 'cpu_usage',
    condition: {
      operator: '>',
      value: 90
    },
    severity: 'critical' as AlertSeverity,
    enabled: true,
    notification: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
    alertManager = AlertManager.getInstance();
    alertManager.clearState();
  });

  describe('规则管理', () => {
    it('should add alert rule', () => {
      alertManager.addRule(mockRule);
      expect(alertManager.getRules()).toContainEqual(mockRule);
    });

    it('should update alert rule', () => {
      alertManager.addRule(mockRule);
      
      const updatedRule = {
        ...mockRule,
        condition: {
          ...mockRule.condition,
          value: 95
        }
      };
      
      alertManager.updateRule(updatedRule);
      expect(alertManager.getRules()).toContainEqual(updatedRule);
    });

    it('should delete alert rule', () => {
      alertManager.addRule(mockRule);
      alertManager.deleteRule(mockRule.id);
      expect(alertManager.getRules()).not.toContainEqual(mockRule);
    });

    it('should get rule by id', () => {
      alertManager.addRule(mockRule);
      const rule = alertManager.getRule(mockRule.id);
      expect(rule).toEqual(mockRule);
    });
  });

  describe('告警评估', () => {
    it('should evaluate metric and trigger alert', () => {
      const mockNotify = vi.fn();
      alertManager.setNotificationHandler(mockNotify);
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 模拟连续5分钟CPU使用率超过90%
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      expect(mockNotify).toHaveBeenCalledWith(expect.objectContaining({
        type: 'trigger',
        rule: mockRule,
        value: 95
      }));
    });

    it('should not trigger alert if threshold not met', () => {
      const mockNotify = vi.fn();
      alertManager.setNotificationHandler(mockNotify);
      
      alertManager.addRule(mockRule);
      alertManager.evaluateMetric('cpu_usage', 85, Date.now());
      
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('should not trigger alert if duration not met', () => {
      const mockNotify = vi.fn();
      alertManager.setNotificationHandler(mockNotify);
      
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 只有3分钟超过阈值，不满足5分钟条件
      for (let i = 0; i < 3; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      expect(mockNotify).not.toHaveBeenCalled();
    });
  });

  describe('告警状态管理', () => {
    it('should track active alerts', () => {
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      const activeAlerts = alertManager.getActiveAlerts();
      expect(activeAlerts).toContainEqual(expect.objectContaining({
        ruleId: mockRule.id,
        value: 95,
        status: 'active'
      }));
    });

    it('should resolve alert when metric returns to normal', () => {
      const mockNotify = vi.fn();
      alertManager.setNotificationHandler(mockNotify);
      
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 先触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      // 指标恢复正常
      alertManager.evaluateMetric('cpu_usage', 80, baseTime + 300000);
      
      expect(alertManager.getActiveAlerts()).toHaveLength(0);
      expect(mockNotify).toHaveBeenLastCalledWith(expect.objectContaining({
        type: 'resolve',
        rule: mockRule,
        value: 80
      }));
    });
  });

  describe('告警通知', () => {
    it('should support multiple notification handlers', () => {
      const mockNotify1 = vi.fn();
      const mockNotify2 = vi.fn();
      
      alertManager.addNotificationHandler(mockNotify1);
      alertManager.addNotificationHandler(mockNotify2);
      
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      expect(mockNotify1).toHaveBeenCalled();
      expect(mockNotify2).toHaveBeenCalled();
    });

    it('should remove notification handler', () => {
      const mockNotify = vi.fn();
      
      alertManager.addNotificationHandler(mockNotify);
      alertManager.removeNotificationHandler(mockNotify);
      
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      // 触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      expect(mockNotify).not.toHaveBeenCalled();
    });
  });

  describe('告警历史', () => {
    it('should record alert history', () => {
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      
      // 触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 95, baseTime + i * 60000);
      }
      
      // 恢复正常
      alertManager.evaluateMetric('cpu_usage', 80, baseTime + 300000);
      
      const history = alertManager.getAlertHistory();
      expect(history).toContainEqual(expect.objectContaining({
        ruleId: mockRule.id,
        startTime: expect.any(Number),
        endTime: expect.any(Number),
        value: 95,
        status: 'resolved'
      }));
    });

    it('should limit history size', () => {
      alertManager.setHistoryLimit(2);
      alertManager.addRule(mockRule);
      
      const baseTime = Date.now();
      
      // 触发3次告警
      for (let j = 0; j < 3; j++) {
        const cycleTime = baseTime + j * 600000;
        
        // 触发告警
        for (let i = 0; i < 5; i++) {
          alertManager.evaluateMetric('cpu_usage', 95, cycleTime + i * 60000);
        }
        
        // 恢复正常
        alertManager.evaluateMetric('cpu_usage', 80, cycleTime + 300000);
      }
      
      expect(alertManager.getAlertHistory()).toHaveLength(2);
    });
  });
}); 