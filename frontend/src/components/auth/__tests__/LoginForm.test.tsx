import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { LoginFormData } from '@/types/auth';

import { setupAuthTest } from '@/tests/utils/test-utils';

import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnFormChange = vi.fn();
  const mockOnTogglePassword = vi.fn();

  const defaultProps = {
    formData: { username: '', password: '' } as LoginFormData,
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
    const { findPasswordInput, getByRole } = setupAuthTest(
      <LoginForm {...defaultProps} />
    );

    expect(getByRole('heading', { level: 1, name: '登录' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: '用户名' })).toBeInTheDocument();
    expect(findPasswordInput()).toBeTruthy();
    expect(getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('应该在输入时触发表单变更', () => {
    const { getByLabelText } = setupAuthTest(<LoginForm {...defaultProps} />);

    fireEvent.change(getByLabelText('用户名'), {
      target: { value: 'testuser' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ username: 'testuser' });

    fireEvent.change(getByLabelText('密码'), {
      target: { value: 'testpass' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ password: 'testpass' });
  });

  it('应该正确切换密码可见性', () => {
    const { getByTestId } = setupAuthTest(<LoginForm {...defaultProps} />);

    const toggleButton = getByTestId('password-visibility-toggle');
    fireEvent.click(toggleButton);

    expect(mockOnTogglePassword).toHaveBeenCalled();
  });

  it('应该在提交时触发onSubmit', () => {
    const { getByTestId } = setupAuthTest(<LoginForm {...defaultProps} />);

    const form = getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('在禁用状态下应该禁用所有输入和按钮', () => {
    const { getByLabelText, getByRole, getByTestId } = setupAuthTest(
      <LoginForm {...defaultProps} disabled />
    );

    expect(getByLabelText('用户名')).toBeDisabled();
    expect(getByLabelText('密码')).toBeDisabled();
    expect(getByRole('button', { name: '登录' })).toBeDisabled();
    expect(getByTestId('password-visibility-toggle')).toBeDisabled();
  });
});
