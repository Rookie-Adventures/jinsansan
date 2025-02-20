import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RegisterFormData } from '@/types/auth';

import { setupAuthTest } from '@/tests/utils/test-utils';

import RegisterForm from '../RegisterForm';

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnFormChange = vi.fn();
  const mockOnTogglePassword = vi.fn();

  const defaultProps = {
    formData: {
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
    } as RegisterFormData,
    showPassword: false,
    disabled: false,
    onSubmit: mockOnSubmit,
    onFormChange: mockOnFormChange,
    onTogglePassword: mockOnTogglePassword,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染注册表单', () => {
    const { findPasswordInput, getByRole, getByLabelText } = setupAuthTest(
      <RegisterForm {...defaultProps} />
    );

    expect(getByRole('heading', { level: 1, name: '注册' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: '用户名' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: '邮箱' })).toBeInTheDocument();
    expect(findPasswordInput()).toBeTruthy();
    expect(getByLabelText('确认密码')).toBeInTheDocument();
    expect(getByRole('button', { name: '注册' })).toBeInTheDocument();
  });

  it('应该在输入时触发表单变更', () => {
    const { getByLabelText } = setupAuthTest(<RegisterForm {...defaultProps} />);

    fireEvent.change(getByLabelText('用户名'), {
      target: { value: 'testuser' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ username: 'testuser' });

    fireEvent.change(getByLabelText('邮箱'), {
      target: { value: 'test@example.com' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ email: 'test@example.com' });

    fireEvent.change(getByLabelText('密码'), {
      target: { value: 'testpass' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ password: 'testpass' });

    fireEvent.change(getByLabelText('确认密码'), {
      target: { value: 'testpass' },
    });
    expect(mockOnFormChange).toHaveBeenCalledWith({ confirmPassword: 'testpass' });
  });

  it('应该正确切换密码可见性', () => {
    const { getAllByTestId } = setupAuthTest(<RegisterForm {...defaultProps} />);

    const toggleButtons = getAllByTestId('password-visibility-toggle');
    expect(toggleButtons).toHaveLength(2); // 密码和确认密码字段都有切换按钮

    fireEvent.click(toggleButtons[0]); // 点击密码字段的切换按钮
    expect(mockOnTogglePassword).toHaveBeenCalled();

    fireEvent.click(toggleButtons[1]); // 点击确认密码字段的切换按钮
    expect(mockOnTogglePassword).toHaveBeenCalledTimes(2);
  });

  it('应该在提交时触发onSubmit', () => {
    const { getByTestId } = setupAuthTest(<RegisterForm {...defaultProps} />);

    const form = getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('在禁用状态下应该禁用所有输入和按钮', () => {
    const { getByLabelText, getByRole, getAllByTestId } = setupAuthTest(
      <RegisterForm {...defaultProps} disabled />
    );

    expect(getByLabelText('用户名')).toBeDisabled();
    expect(getByLabelText('邮箱')).toBeDisabled();
    expect(getByLabelText('密码')).toBeDisabled();
    expect(getByLabelText('确认密码')).toBeDisabled();
    expect(getByRole('button', { name: '注册' })).toBeDisabled();

    const toggleButtons = getAllByTestId('password-visibility-toggle');
    toggleButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('应该使用默认值渲染表单', () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass',
      confirmPassword: 'testpass',
    } as RegisterFormData;

    const { getByLabelText } = setupAuthTest(
      <RegisterForm {...defaultProps} formData={formData} />
    );

    expect(getByLabelText('用户名')).toHaveValue('testuser');
    expect(getByLabelText('邮箱')).toHaveValue('test@example.com');
    expect(getByLabelText('密码')).toHaveValue('testpass');
    expect(getByLabelText('确认密码')).toHaveValue('testpass');
  });
});
