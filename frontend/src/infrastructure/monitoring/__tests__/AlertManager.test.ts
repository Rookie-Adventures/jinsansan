import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AlertRule } from '../types';

import { AlertManager } from '../AlertManager';

describe('AlertManager', () => {
  let alertManager: AlertManager;
  let mockNotificationHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    alertManager = AlertManager.getInstance();
    alertManager.clearState();
    mockNotificationHandler = vi.fn();
    alertManager.setNotificationHandler(mockNotificationHandler);
  });

  describe('规则管理', () => {
    const testRule: AlertRule = {
      id: 'test-rule-1',
      name: '测试规则1',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 80,
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com'],
      },
    };

    it('应该能够添加新规则', () => {
      alertManager.addRule(testRule);
      expect(alertManager.getRule(testRule.id)).toEqual(testRule);
    });

    it('应该能够更新已存在的规则', () => {
      alertManager.addRule(testRule);
      const updatedRule = {
        ...testRule,
        name: '更新后的规则名称',
      };
      alertManager.updateRule(updatedRule);
      expect(alertManager.getRule(testRule.id)).toEqual(updatedRule);
    });

    it('应该能够删除规则', () => {
      alertManager.addRule(testRule);
      alertManager.deleteRule(testRule.id);
      expect(alertManager.getRule(testRule.id)).toBeUndefined();
    });

    it('应该能够获取所有规则', () => {
      const rule2: AlertRule = {
        ...testRule,
        id: 'test-rule-2',
        name: '测试规则2',
      };
      alertManager.addRule(testRule);
      alertManager.addRule(rule2);
      const rules = alertManager.getRules();
      expect(rules).toHaveLength(2);
      expect(rules).toContainEqual(testRule);
      expect(rules).toContainEqual(rule2);
    });
  });

  describe('告警评估', () => {
    const testRule: AlertRule = {
      id: 'test-rule-1',
      name: '测试规则1',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 80,
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com'],
      },
    };

    beforeEach(() => {
      alertManager.addRule(testRule);
    });

    it('应该在指标超过阈值时触发告警', () => {
      const baseTime = Date.now();
      // 模拟5分钟内的连续高CPU使用率
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      const activeAlerts = alertManager.getActiveAlerts();
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].ruleId).toBe(testRule.id);
      expect(activeAlerts[0].value).toBe(85);
      expect(mockNotificationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'trigger',
          rule: testRule,
          value: 85,
        })
      );
    });

    it('应该在指标恢复正常时解除告警', () => {
      const baseTime = Date.now();
      // 先触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      // 然后恢复正常
      alertManager.evaluateMetric('cpu_usage', 75, baseTime + 300000);

      expect(alertManager.getActiveAlerts()).toHaveLength(0);
      expect(mockNotificationHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'resolve',
          rule: testRule,
          value: 75,
        })
      );
    });

    it('不应该对禁用的规则触发告警', () => {
      const disabledRule = { ...testRule, enabled: false };
      alertManager.updateRule(disabledRule);

      const baseTime = Date.now();
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      expect(alertManager.getActiveAlerts()).toHaveLength(0);
      expect(mockNotificationHandler).not.toHaveBeenCalled();
    });

    it('应该正确处理不同操作符的条件', () => {
      const operators: Array<'>' | '<' | '>=' | '<=' | '==' | '!='> = [
        '>',
        '<',
        '>=',
        '<=',
        '==',
        '!=',
      ];
      const testValues = [75, 80, 85];

      operators.forEach(operator => {
        const rule: AlertRule = {
          ...testRule,
          condition: {
            operator,
            value: 80,
          },
        };

        testValues.forEach(value => {
          // 每个值测试前清除状态并添加规则
          alertManager.clearState();
          alertManager.addRule(rule);

          const baseTime = Date.now();
          // 确保有足够的连续记录，每次间隔 60 秒，总共 5 分钟
          for (let i = 0; i < 5; i++) {
            alertManager.evaluateMetric('cpu_usage', value, baseTime + i * 60000);
          }

          const shouldTrigger = (() => {
            switch (operator) {
              case '>':
                return value > 80;
              case '<':
                return value < 80;
              case '>=':
                return value >= 80;
              case '<=':
                return value <= 80;
              case '==':
                return value === 80;
              case '!=':
                return value !== 80;
              default:
                return false;
            }
          })();

          if (shouldTrigger) {
            expect(alertManager.getActiveAlerts()).toHaveLength(1);
            const alert = alertManager.getActiveAlerts()[0];
            expect(alert.value).toBe(value);
            expect(alert.ruleId).toBe(rule.id);
          } else {
            expect(alertManager.getActiveAlerts()).toHaveLength(0);
          }
        });
      });
    });
  });

  describe('告警历史', () => {
    const testRule: AlertRule = {
      id: 'test-rule-1',
      name: '测试规则1',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 80,
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com'],
      },
    };

    beforeEach(() => {
      alertManager.addRule(testRule);
    });

    it('应该正确记录告警历史', () => {
      const baseTime = Date.now();

      // 触发告警
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      // 解除告警
      alertManager.evaluateMetric('cpu_usage', 75, baseTime + 300000);

      const history = alertManager.getAlertHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        ruleId: testRule.id,
        status: 'resolved',
        value: 85,
      });
    });

    it('应该遵守历史记录限制', () => {
      alertManager.setHistoryLimit(2);
      const baseTime = Date.now();

      // 创建3个告警周期
      for (let j = 0; j < 3; j++) {
        // 触发告警
        for (let i = 0; i < 5; i++) {
          alertManager.evaluateMetric('cpu_usage', 85, baseTime + j * 300000 + i * 60000);
        }
        // 解除告警
        alertManager.evaluateMetric('cpu_usage', 75, baseTime + j * 300000 + 300000);
      }

      const history = alertManager.getAlertHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('通知处理', () => {
    const testRule: AlertRule = {
      id: 'test-rule-1',
      name: '测试规则1',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 80,
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com'],
      },
    };

    beforeEach(() => {
      alertManager.addRule(testRule);
    });

    it('应该能够添加多个通知处理器', () => {
      const handler2 = vi.fn();
      alertManager.addNotificationHandler(handler2);

      const baseTime = Date.now();
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      expect(mockNotificationHandler).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('应该能够移除通知处理器', () => {
      alertManager.removeNotificationHandler(mockNotificationHandler);

      const baseTime = Date.now();
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      expect(mockNotificationHandler).not.toHaveBeenCalled();
    });

    it('应该在通知处理器出错时继续运行', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('通知处理器错误');
      });
      const successHandler = vi.fn();

      alertManager.setNotificationHandler(errorHandler);
      alertManager.addNotificationHandler(successHandler);

      const baseTime = Date.now();
      for (let i = 0; i < 5; i++) {
        alertManager.evaluateMetric('cpu_usage', 85, baseTime + i * 60000);
      }

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });
});
