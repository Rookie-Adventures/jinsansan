import { vi } from 'vitest';
import type { AlertRule } from '@/infrastructure/monitoring/types';

export type AlertRuleOverrides = Partial<Omit<AlertRule, 'id'>>;

export const createTestRule = (overrides: AlertRuleOverrides = {}): AlertRule => ({
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

interface MockAlertManager {
  addRule: ReturnType<typeof vi.fn>;
  updateRule: ReturnType<typeof vi.fn>;
  removeRule: ReturnType<typeof vi.fn>;
  getRules: ReturnType<typeof vi.fn>;
  clearRules: ReturnType<typeof vi.fn>;
  triggerAlert: ReturnType<typeof vi.fn>;
  getHistory: ReturnType<typeof vi.fn>;
  clearHistory: ReturnType<typeof vi.fn>;
  setNotificationHandler: ReturnType<typeof vi.fn>;
  getInstance: ReturnType<typeof vi.fn>;
}

export const mockAlertManager = (): MockAlertManager => {
  const mock: MockAlertManager = {
    addRule: vi.fn(),
    updateRule: vi.fn(),
    removeRule: vi.fn(),
    getRules: vi.fn().mockReturnValue([]),
    clearRules: vi.fn(),
    triggerAlert: vi.fn(),
    getHistory: vi.fn().mockReturnValue([]),
    clearHistory: vi.fn(),
    setNotificationHandler: vi.fn(),
    getInstance: vi.fn(),
  };
  mock.getInstance.mockReturnValue(mock);
  return mock;
}; 