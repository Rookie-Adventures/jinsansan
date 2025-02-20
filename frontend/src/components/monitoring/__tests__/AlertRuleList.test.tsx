import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import type { AlertRule } from '@/infrastructure/monitoring/types';

import { AlertRuleList } from '../AlertRuleList';

describe('AlertRuleList', () => {
  const mockRules: AlertRule[] = [
    {
      id: '1',
      name: 'CPU Usage Alert',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 80,
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com', 'admin@example.com'],
      },
    },
    {
      id: '2',
      name: 'Memory Usage Alert',
      type: 'threshold',
      metric: 'memory_usage',
      condition: {
        operator: '>=',
        value: 90,
      },
      severity: 'critical',
      enabled: false,
      notification: {
        email: [],
      },
    },
  ];

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染告警规则列表', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    // 验证表头
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('规则名称')).toBeInTheDocument();
    expect(screen.getByText('监控指标')).toBeInTheDocument();
    expect(screen.getByText('条件')).toBeInTheDocument();
    expect(screen.getByText('级别')).toBeInTheDocument();
    expect(screen.getByText('通知')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();

    // 验证规则内容
    expect(screen.getByText('CPU Usage Alert')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage Alert')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('2 个接收人')).toBeInTheDocument();
    expect(screen.getByText('未设置')).toBeInTheDocument();
  });

  it('应该正确处理规则启用状态切换', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    const switches = screen.getAllByRole('checkbox');
    expect(switches).toHaveLength(2);

    // 切换第一个规则的状态
    fireEvent.click(switches[0]);
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1', false);

    // 切换第二个规则的状态
    fireEvent.click(switches[1]);
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('2', true);
  });

  it('应该正确处理编辑操作', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockRules[0]);
  });

  it('应该正确处理删除操作', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[1]);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('2');
  });

  it('应该正确显示不同级别的告警', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    const warningChip = screen.getByRole('status', { name: 'warning' });
    const criticalChip = screen.getByRole('status', { name: 'critical' });

    expect(warningChip).toHaveClass('MuiChip-colorWarning');
    expect(criticalChip).toHaveClass('MuiChip-colorError');
  });

  it('应该正确显示通知邮箱信息', () => {
    render(<AlertRuleList rules={mockRules} {...mockHandlers} />);

    // 验证有邮箱的规则
    const emailChip = screen.getByRole('status', { name: 'test@example.com, admin@example.com' });
    expect(emailChip).toBeInTheDocument();
    expect(emailChip).toHaveTextContent('2 个接收人');

    // 验证无邮箱的规则
    const noEmailChip = screen.getByRole('status', { name: '未设置' });
    expect(noEmailChip).toBeInTheDocument();
  });

  it('应该在规则列表为空时正确渲染', () => {
    render(<AlertRuleList rules={[]} {...mockHandlers} />);

    // 应该只显示表头
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
}); 