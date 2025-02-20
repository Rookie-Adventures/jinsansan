import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AlertRule } from '../types';

import { AlertManager } from '../AlertManager';

// 测试辅助类型和函数
interface TestContext {
  alertManager: AlertManager;
  notificationHandler: ReturnType<typeof createNotificationHandler>;
}

// 创建测试规则的工厂函数
const createTestRule = (overrides: Partial<AlertRule> = {}): AlertRule => ({
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
  ...overrides,
});

// 创建通知处理器的辅助函数
function createNotificationHandler() {
  const handler = vi.fn();
  return { handler };
}

// 告警评估辅助函数
const evaluateMetricSequence = (
  context: TestContext,
  value: number,
  count: number = 5,
  interval: number = 60000
) => {
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    context.alertManager.evaluateMetric('cpu_usage', value, baseTime + i * interval);
  }
  return baseTime;
};

// 验证告警状态辅助函数
const verifyAlertState = (
  context: TestContext,
  expectedAlerts: number,
  expectedValue?: number,
  expectedRuleId?: string
) => {
  const activeAlerts = context.alertManager.getActiveAlerts();
  expect(activeAlerts).toHaveLength(expectedAlerts);
  if (expectedAlerts > 0 && expectedValue !== undefined && expectedRuleId !== undefined) {
    expect(activeAlerts[0].value).toBe(expectedValue);
    expect(activeAlerts[0].ruleId).toBe(expectedRuleId);
  }
};

describe('AlertManager', () => {
  let context: TestContext;

  beforeEach(() => {
    const alertManager = AlertManager.getInstance();
    alertManager.clearState();
    const notificationHandler = createNotificationHandler();
    alertManager.setNotificationHandler(notificationHandler.handler);
    context = { alertManager, notificationHandler };
  });

  describe('规则管理', () => {
    const testRule = createTestRule();

    it('应该能够添加新规则', () => {
      context.alertManager.addRule(testRule);
      expect(context.alertManager.getRule(testRule.id)).toEqual(testRule);
    });

    it('应该能够更新已存在的规则', () => {
      context.alertManager.addRule(testRule);
      const updatedRule = createTestRule({ name: '更新后的规则名称' });
      context.alertManager.updateRule(updatedRule);
      expect(context.alertManager.getRule(testRule.id)).toEqual(updatedRule);
    });

    it('应该能够删除规则', () => {
      context.alertManager.addRule(testRule);
      context.alertManager.deleteRule(testRule.id);
      expect(context.alertManager.getRule(testRule.id)).toBeUndefined();
    });

    it('应该能够获取所有规则', () => {
      const rule2 = createTestRule({ id: 'test-rule-2', name: '测试规则2' });
      context.alertManager.addRule(testRule);
      context.alertManager.addRule(rule2);
      const rules = context.alertManager.getRules();
      expect(rules).toHaveLength(2);
      expect(rules).toContainEqual(testRule);
      expect(rules).toContainEqual(rule2);
    });
  });

  describe('告警评估', () => {
    const testRule = createTestRule();

    beforeEach(() => {
      context.alertManager.addRule(testRule);
    });

    it('应该在指标超过阈值时触发告警', () => {
      evaluateMetricSequence(context, 85);
      verifyAlertState(context, 1, 85, testRule.id);
      expect(context.notificationHandler.handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'trigger',
          rule: testRule,
          value: 85,
        })
      );
    });

    it('应该在指标恢复正常时解除告警', () => {
      const baseTime = evaluateMetricSequence(context, 85);
      context.alertManager.evaluateMetric('cpu_usage', 75, baseTime + 300000);

      verifyAlertState(context, 0);
      expect(context.notificationHandler.handler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'resolve',
          rule: testRule,
          value: 75,
        })
      );
    });

    it('不应该对禁用的规则触发告警', () => {
      const disabledRule = createTestRule({ enabled: false });
      context.alertManager.updateRule(disabledRule);
      evaluateMetricSequence(context, 85);
      verifyAlertState(context, 0);
      expect(context.notificationHandler.handler).not.toHaveBeenCalled();
    });

    it('应该正确处理不同操作符的条件', () => {
      const operators = ['>', '<', '>=', '<=', '==', '!='] as const;
      const testValues = [75, 80, 85];

      operators.forEach(operator => {
        const rule = createTestRule({
          condition: { operator, value: 80 },
        });

        testValues.forEach(value => {
          context.alertManager.clearState();
          context.alertManager.addRule(rule);
          evaluateMetricSequence(context, value);

          const shouldTrigger = (() => {
            switch (operator) {
              case '>': return value > 80;
              case '<': return value < 80;
              case '>=': return value >= 80;
              case '<=': return value <= 80;
              case '==': return value === 80;
              case '!=': return value !== 80;
              default: return false;
            }
          })();

          verifyAlertState(context, shouldTrigger ? 1 : 0, shouldTrigger ? value : undefined, shouldTrigger ? rule.id : undefined);
        });
      });
    });
  });

  describe('告警历史', () => {
    const testRule = createTestRule();

    beforeEach(() => {
      context.alertManager.addRule(testRule);
    });

    it('应该正确记录告警历史', () => {
      const baseTime = evaluateMetricSequence(context, 85);
      context.alertManager.evaluateMetric('cpu_usage', 75, baseTime + 300000);

      const history = context.alertManager.getAlertHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        ruleId: testRule.id,
        status: 'resolved',
        value: 85,
      });
    });

    it('应该遵守历史记录限制', () => {
      context.alertManager.setHistoryLimit(2);
      const baseTime = evaluateMetricSequence(context, 85);

      // 创建3个告警周期
      for (let j = 0; j < 3; j++) {
        // 触发告警
        evaluateMetricSequence(context, 85);
        // 解除告警
        context.alertManager.evaluateMetric('cpu_usage', 75, baseTime + j * 300000 + 300000);
      }

      const history = context.alertManager.getAlertHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('通知处理', () => {
    const testRule = createTestRule();

    beforeEach(() => {
      context.alertManager.addRule(testRule);
    });

    it('应该能够添加多个通知处理器', () => {
      const handler2 = vi.fn();
      context.alertManager.addNotificationHandler(handler2);

      evaluateMetricSequence(context, 85);

      expect(context.notificationHandler.handler).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('应该能够移除通知处理器', () => {
      context.alertManager.removeNotificationHandler(context.notificationHandler.handler);

      evaluateMetricSequence(context, 85);

      expect(context.notificationHandler.handler).not.toHaveBeenCalled();
    });

    it('应该在通知处理器出错时继续运行', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('通知处理器错误');
      });
      const successHandler = vi.fn();

      context.alertManager.setNotificationHandler(errorHandler);
      context.alertManager.addNotificationHandler(successHandler);

      evaluateMetricSequence(context, 85);

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });
});
