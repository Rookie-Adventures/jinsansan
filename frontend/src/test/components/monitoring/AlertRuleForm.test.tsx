import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertRuleForm } from '@/components/monitoring/AlertRuleForm';
import type { AlertRule } from '@/infrastructure/monitoring/types';

describe('AlertRuleForm Security Tests', () => {
  // 基础渲染测试
  it('should render safely without props', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    
    expect(() => render(
      <AlertRuleForm onSubmit={mockSubmit} onCancel={mockCancel} />
    )).not.toThrow();
  });

  // XSS防护测试
  it('should safely handle potentially malicious input', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    const nameInput = screen.getByLabelText(/规则名称/i);
    const maliciousInput = '<script>alert("xss")</script>';
    
    fireEvent.change(nameInput, { target: { value: maliciousInput } });
    fireEvent.submit(screen.getByRole('form'));
    
    // 验证提交的数据是否被正确转义
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.not.stringContaining('<script>'),
        type: 'threshold',
        condition: expect.any(Object),
        notification: expect.any(Object)
      })
    );
  });

  // 数据验证测试
  it('should validate email format', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    const emailInput = screen.getByLabelText(/通知邮箱/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(screen.getByRole('form'));
    
    // 验证无效邮箱是否被拦截
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/邮箱格式不正确/i)).toBeInTheDocument();
  });

  // 阈值范围测试
  it('should validate threshold values', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    const thresholdInput = screen.getByLabelText(/阈值/i);
    fireEvent.change(thresholdInput, { target: { value: '-1' } });
    fireEvent.submit(screen.getByRole('form'));
    
    // 验证负数阈值是否被拦截
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/阈值不能为负数/i)).toBeInTheDocument();
  });

  // 初始值测试
  it('should initialize with provided rule', async () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    
    const mockRule: AlertRule = {
      id: '1',
      name: 'Test Rule',
      type: 'threshold',
      metric: 'cpu_usage',
      condition: {
        operator: '>',
        value: 90
      },
      severity: 'warning',
      enabled: true,
      notification: {
        email: ['test@example.com']
      }
    };

    render(<AlertRuleForm rule={mockRule} onSubmit={mockSubmit} onCancel={mockCancel} />);

    // 等待组件渲染完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByLabelText(/规则名称/i)).toHaveValue('Test Rule');
    
    // 检查 Select 组件的值
    const metricSelect = screen.getByLabelText(/监控指标/i);
    expect(metricSelect).toBeInTheDocument();
    expect(metricSelect.textContent).toBe('cpu_usage');
    
    expect(screen.getByLabelText(/阈值/i)).toHaveValue(90);
    expect(screen.getByLabelText(/通知邮箱/i)).toHaveValue('test@example.com');
  });
}); 