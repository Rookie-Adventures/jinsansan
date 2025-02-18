import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnFormChange = vi.fn();
  const mockOnTogglePassword = vi.fn();

  const defaultProps = {
    formData: { username: '', password: '' },
    showPassword: false,
    disabled: false,
    onSubmit: mockOnSubmit,
    onFormChange: mockOnFormChange,
    onTogglePassword: mockOnTogglePassword,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染登录表单', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('应该在输入时触发表单变更', () => {
    render(<LoginForm {...defaultProps} />);

    const usernameInput = screen.getByLabelText('用户名');
    const passwordInput = screen.getByLabelText('密码');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ username: 'testuser' });

    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ password: 'testpass' });
  });

  it('应该正确切换密码可见性', () => {
    render(<LoginForm {...defaultProps} />);

    const toggleButton = screen.getByTestId('password-visibility-toggle');
    fireEvent.click(toggleButton);

    expect(mockOnTogglePassword).toHaveBeenCalled();
  });

  it('应该在提交时触发onSubmit', () => {
    render(<LoginForm {...defaultProps} />);

    const form = screen.getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('在禁用状态下应该禁用所有输入和按钮', () => {
    render(<LoginForm {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('用户名')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
    expect(screen.getByRole('button', { name: '登录' })).toBeDisabled();
    expect(screen.getByTestId('password-visibility-toggle')).toBeDisabled();
  });
});
