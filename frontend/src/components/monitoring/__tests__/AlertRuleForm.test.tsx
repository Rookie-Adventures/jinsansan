import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertRuleForm } from '../AlertRuleForm';
import type { AlertRule } from '@/infrastructure/monitoring/types';

describe('AlertRuleForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

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

    // 检查表单字段的初始值
    expect(screen.getByLabelText('规则名称')).toHaveValue(defaultRule.name);
    expect(screen.getByLabelText('通知邮箱')).toHaveValue(defaultRule.notification.email?.join(','));
  });

  it('validates required fields', async () => {
    render(
      <AlertRuleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // 尝试提交空表单
    fireEvent.submit(screen.getByRole('form'));

    // 检查错误消息
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

    // 输入无效的邮箱格式
    const emailInput = screen.getByLabelText('通知邮箱');
    await userEvent.type(emailInput, 'invalid-email');
    
    // 提交表单
    fireEvent.submit(screen.getByRole('form'));

    // 检查错误消息
    expect(await screen.findByText('邮箱格式不正确')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with sanitized form data when form is valid', async () => {
    render(
      <AlertRuleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // 填写表单
    await userEvent.type(screen.getByLabelText('规则名称'), 'New Rule');
    await userEvent.type(screen.getByLabelText('通知邮箱'), 'test@example.com');
    
    // 提交表单
    fireEvent.submit(screen.getByRole('form'));

    // 检查是否调用了 onSubmit
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Rule',
      notification: {
        email: ['test@example.com']
      }
    }));
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AlertRuleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // 点击取消按钮
    fireEvent.click(screen.getByText('取消'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 