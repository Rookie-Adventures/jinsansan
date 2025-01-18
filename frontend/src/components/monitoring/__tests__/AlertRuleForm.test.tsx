import type { AlertRule } from '@/infrastructure/monitoring/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertRuleForm } from '../AlertRuleForm';

describe('AlertRuleForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const user = userEvent.setup();

  const defaultRule: AlertRule = {
    id: '1',
    name: 'Test Rule',
    type: 'threshold',
    metric: 'page_load',
    condition: {
      operator: '>',
      value: 1000
    },
    severity: 'warning',
    enabled: true,
    notification: {
      email: ['test@example.com']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 基础功能测试
  describe('基础功能', () => {
    it('renders form fields correctly', () => {
      render(
        <AlertRuleForm
          rule={defaultRule}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 检查表单字段是否正确渲染
      expect(screen.getByLabelText('规则名称')).toBeInTheDocument();
      expect(screen.getByLabelText('规则类型')).toBeInTheDocument();
      expect(screen.getByLabelText('监控指标')).toBeInTheDocument();
      expect(screen.getByLabelText('操作符')).toBeInTheDocument();
      expect(screen.getByLabelText('阈值')).toBeInTheDocument();
      expect(screen.getByLabelText('告警级别')).toBeInTheDocument();
      expect(screen.getByLabelText('通知邮箱')).toBeInTheDocument();
      expect(screen.getByLabelText('启用规则')).toBeInTheDocument();
    });

    it('fills form with initial values when rule prop is provided', () => {
      render(
        <AlertRuleForm
          rule={defaultRule}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('规则名称')).toHaveValue(defaultRule.name);
      expect(screen.getByLabelText('通知邮箱')).toHaveValue(defaultRule.notification.email?.join(','));
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('取消'));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  // 表单验证测试
  describe('表单验证', () => {
    it('validates required fields', async () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.submit(screen.getByRole('form'));
      expect(await screen.findByText('规则名称不能为空')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText('通知邮箱');
      await user.type(emailInput, 'invalid-email');
      fireEvent.submit(screen.getByRole('form'));

      expect(await screen.findByText('邮箱格式不正确')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates threshold values', async () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const thresholdInput = screen.getByLabelText('阈值');
      fireEvent.change(thresholdInput, { target: { value: '-1' } });
      fireEvent.submit(screen.getByRole('form'));

      expect(await screen.findByText('阈值不能为负数')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // 安全性测试
  describe('安全性', () => {
    it('should safely handle potentially malicious input', async () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('规则名称');
      const maliciousInput = '<script>alert("xss")</script>';

      await user.type(nameInput, maliciousInput);
      fireEvent.submit(screen.getByRole('form'));

      // 验证提交的数据是否被正确转义
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.not.stringContaining('<script>'),
          type: 'threshold',
          condition: expect.any(Object),
          notification: expect.any(Object)
        })
      );
    });

    it('should render safely without props', () => {
      expect(() => render(
        <AlertRuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      )).not.toThrow();
    });
  });

  // 数据提交测试
  describe('数据提交', () => {
    it('calls onSubmit with sanitized form data when form is valid', async () => {
      render(
        <AlertRuleForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('规则名称'), 'New Rule');
      await user.type(screen.getByLabelText('通知邮箱'), 'test@example.com');

      fireEvent.submit(screen.getByRole('form'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Rule',
          notification: {
            email: ['test@example.com']
          }
        })
      );
    });
  });
}); 