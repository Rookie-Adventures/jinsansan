import type { AlertRule } from '@/infrastructure/monitoring/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    test('validates required fields', async () => {
      const { getByRole, findByTestId } = render(
        <AlertRuleForm 
          onSubmit={vi.fn()} 
          onCancel={vi.fn()} 
        />
      );
      
      // 提交空表单（这会触发所有字段的验证）
      const submitButton = getByRole('button', { name: '保存' });
      await user.click(submitButton);
      
      // 等待错误消息出现并验证
      await waitFor(async () => {
        const errorElement = await findByTestId('name-error-text');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement.textContent).toBe('规则名称不能为空');
      }, { timeout: 3000 });
    });

    test('validates email format', async () => {
      const { getByLabelText, getByRole } = render(
        <AlertRuleForm 
          onSubmit={vi.fn()} 
          onCancel={vi.fn()} 
        />
      );
      
      // 输入必填字段
      await user.type(getByLabelText('规则名称'), 'Test Rule');
      
      // 输入无效的邮箱
      await user.type(getByLabelText('通知邮箱'), 'invalid-email');
      
      // 提交表单
      await user.click(getByRole('button', { name: '保存' }));
      
      // 等待验证完成
      await waitFor(() => {
        expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument();
      });
    });

    test('validates threshold values', async () => {
      const { getByTestId, findByTestId } = render(
        <AlertRuleForm 
          onSubmit={vi.fn()} 
          onCancel={vi.fn()} 
        />
      );
      
      // 输入无效的阈值
      const thresholdInput = getByTestId('threshold-input');
      await user.clear(thresholdInput);
      await user.type(thresholdInput, '-1');
      
      // 触发验证（通过失去焦点）
      await user.tab();
      
      // 等待错误消息出现并验证
      await waitFor(async () => {
        const errorElement = await findByTestId('threshold-error-text');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement.textContent).toBe('阈值不能为负数');
      }, { timeout: 3000 });
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