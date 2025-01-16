import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertRuleForm } from '@/components/monitoring/AlertRuleForm';

describe('AlertRuleForm Security Tests', () => {
  // 基础渲染测试
  it('should render safely without props', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    expect(() => render(
      <AlertRuleForm onSubmit={onSubmit} onCancel={onCancel} />
    )).not.toThrow();
  });

  // XSS防护测试
  it('should safely handle potentially malicious input', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    const nameInput = screen.getByLabelText(/规则名称/i);
    const maliciousInput = '<script>alert("xss")</script>';
    
    fireEvent.change(nameInput, { target: { value: maliciousInput } });
    fireEvent.submit(screen.getByRole('button', { name: /保存/i }));
    
    // 验证提交的数据是否被正确转义
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.not.stringContaining('<script>')
      })
    );
  });

  // 数据验证测试
  it('should validate email format', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    const emailInput = screen.getByLabelText(/通知邮箱/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(screen.getByRole('button', { name: /保存/i }));
    
    // 验证无效邮箱是否被拦截
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // 阈值范围测试
  it('should validate threshold values', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    render(<AlertRuleForm onSubmit={onSubmit} onCancel={onCancel} />);
    
    const thresholdInput = screen.getByLabelText(/阈值/i);
    fireEvent.change(thresholdInput, { target: { value: '-1' } });
    fireEvent.submit(screen.getByRole('button', { name: /保存/i }));
    
    // 验证负数阈值是否被拦截
    expect(onSubmit).not.toHaveBeenCalled();
  });
}); 