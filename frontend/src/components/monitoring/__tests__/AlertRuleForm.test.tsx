/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { AlertRule, AlertRuleType, AlertSeverity, AlertOperator } from '@/infrastructure/monitoring/types';

import { AlertRuleForm } from '../AlertRuleForm';

// 测试工具和类型
interface TestRuleConfig {
  id?: string;
  name?: string;
  type?: AlertRuleType;
  metric?: string;
  condition?: {
    operator: AlertOperator;
    value: number;
  };
  severity?: AlertSeverity;
  enabled?: boolean;
  notification?: {
    email?: string[];
  };
}

const createTestRule = (config: Partial<TestRuleConfig> = {}): AlertRule => ({
  id: '1',
  name: 'Test Rule',
  type: 'threshold',
  metric: 'page_load',
  condition: {
    operator: '>' as AlertOperator,
    value: 1000,
  },
  severity: 'warning',
  enabled: true,
  notification: {
    email: ['test@example.com'],
  },
  ...config,
});

const renderAlertRuleForm = (props: {
  rule?: AlertRule;
  onSubmit?: Mock;
  onCancel?: Mock;
}) => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };
  const mergedProps = { ...defaultProps, ...props };
  
  return {
    ...render(<AlertRuleForm {...mergedProps} />),
    user: userEvent.setup(),
    ...mergedProps,
  };
};

const fillFormFields = async (user: ReturnType<typeof userEvent.setup>, fields: Partial<TestRuleConfig>) => {
  if (fields.name) {
    await user.type(screen.getByLabelText('规则名称'), fields.name);
  }
  if (fields.notification?.email) {
    await user.type(screen.getByLabelText('通知邮箱'), fields.notification.email.join(','));
  }
};

const verifyFormFields = (rule: AlertRule) => {
  expect(screen.getByLabelText('规则名称')).toHaveValue(rule.name);
  expect(screen.getByLabelText('通知邮箱')).toHaveValue(rule.notification.email?.join(','));
};

const verifyFormSubmission = async (
  onSubmit: Mock,
  expectedData: Partial<AlertRule>
) => {
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining(expectedData)
    );
  });
};

describe('AlertRuleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('renders form fields correctly', () => {
      renderAlertRuleForm({});

      const requiredFields = [
        '规则名称',
        '规则类型',
        '监控指标',
        '操作符',
        '阈值',
        '告警级别',
        '通知邮箱',
        '启用规则'
      ];

      requiredFields.forEach(field => {
        expect(screen.getByLabelText(field)).toBeInTheDocument();
      });
    });

    it('fills form with initial values when rule prop is provided', () => {
      const testRule = createTestRule();
      renderAlertRuleForm({ rule: testRule });
      verifyFormFields(testRule);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const { onCancel } = renderAlertRuleForm({});
      fireEvent.click(screen.getByText('取消'));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('表单验证', () => {
    it('validates required fields', async () => {
      renderAlertRuleForm({});
      fireEvent.submit(screen.getByRole('form'));
      expect(await screen.findByText('规则名称不能为空')).toBeInTheDocument();
    });

    it('validates threshold values', async () => {
      renderAlertRuleForm({});
      fireEvent.change(screen.getByLabelText('阈值'), { target: { value: '-1' } });
      fireEvent.submit(screen.getByRole('form'));
      expect(await screen.findByText('阈值不能为负数')).toBeInTheDocument();
    });

    it('validates email format', async () => {
      const { user } = renderAlertRuleForm({});
      await fillFormFields(user, {
        name: 'Test Rule',
        notification: { email: ['invalid-email'] }
      });
      await user.click(screen.getByRole('button', { name: '保存' }));
      await waitFor(() => {
        expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument();
      });
    });
  });

  describe('安全性', () => {
    it('should safely handle potentially malicious input', async () => {
      const { user, onSubmit } = renderAlertRuleForm({});
      const maliciousInput = '<script>alert("xss")</script>';
      
      await fillFormFields(user, { name: maliciousInput });
      await user.click(screen.getByRole('button', { name: '保存' }));

      await verifyFormSubmission(onSubmit, {
        name: expect.not.stringContaining('<script>'),
        type: 'threshold',
        condition: expect.any(Object),
        notification: expect.any(Object),
      });
    });

    it('should render safely without props', () => {
      expect(() => renderAlertRuleForm({})).not.toThrow();
    });
  });

  describe('数据提交', () => {
    it('calls onSubmit with sanitized form data when form is valid', async () => {
      const { user, onSubmit } = renderAlertRuleForm({});
      const testData = {
        name: 'New Rule',
        notification: { email: ['test@example.com'] }
      };

      await fillFormFields(user, testData);
      fireEvent.submit(screen.getByRole('form'));

      await verifyFormSubmission(onSubmit, testData);
    });
  });
});
