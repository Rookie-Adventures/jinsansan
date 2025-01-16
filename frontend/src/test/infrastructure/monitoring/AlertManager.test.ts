import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlertManager } from '@/infrastructure/monitoring/AlertManager';
import type { MetricType, PerformanceMetric } from '@/infrastructure/monitoring/types';

describe('AlertManager Security Tests', () => {
  let alertManager: AlertManager;

  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
    alertManager = AlertManager.getInstance();
  });

  // 存储安全测试
  it('should safely handle localStorage data corruption', () => {
    // 模拟损坏的数据
    localStorage.setItem('alertConfig', 'invalid-json');
    
    expect(() => {
      AlertManager.getInstance();
    }).not.toThrow();
  });

  // 规则添加安全测试
  it('should sanitize rule input', () => {
    const maliciousRule = {
      name: '<script>alert("xss")</script>',
      type: 'threshold' as const,
      metric: 'page_load',
      condition: {
        operator: '>' as const,
        value: 1000
      },
      severity: 'warning' as const,
      enabled: true,
      notification: {
        email: ['test@example.com']
      }
    };

    const rule = alertManager.addRule(maliciousRule);
    expect(rule.name).not.toContain('<script>');
  });

  // 通知安全测试
  it('should safely handle notification failures', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const metric: PerformanceMetric = {
      type: 'page_load' as MetricType,
      timestamp: Date.now(),
      data: { loadEventEnd: 5000 }
    };

    // 确保错误不会导致系统崩溃
    expect(() => {
      alertManager.checkMetric(metric);
    }).not.toThrow();
  });

  // 数据验证测试
  it('should validate rule data', () => {
    const invalidRule = {
      name: '',  // 空名称
      type: 'invalid-type' as any,
      metric: 'invalid-metric',
      condition: {
        operator: 'invalid' as any,
        value: NaN
      },
      severity: 'invalid' as any,
      enabled: 'not-boolean' as any,
      notification: {
        email: ['invalid-email']
      }
    };

    expect(() => {
      alertManager.addRule(invalidRule);
    }).toThrow();
  });
}); 