import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
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
    },
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
    render(<RegisterForm {...defaultProps} />);

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
  });

  it('应该在输入时触发表单变更', () => {
    render(<RegisterForm {...defaultProps} />);

    const usernameInput = screen.getByLabelText('用户名');
    const emailInput = screen.getByLabelText('邮箱');
    const passwordInput = screen.getByLabelText('密码');
    const confirmPasswordInput = screen.getByLabelText('确认密码');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ username: 'testuser' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ email: 'test@example.com' });

    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ password: 'testpass' });

    fireEvent.change(confirmPasswordInput, { target: { value: 'testpass' } });
    expect(mockOnFormChange).toHaveBeenCalledWith({ confirmPassword: 'testpass' });
  });

  it('应该正确切换密码可见性', () => {
    render(<RegisterForm {...defaultProps} />);

    const toggleButtons = screen.getAllByTestId('password-visibility-toggle');
    expect(toggleButtons).toHaveLength(2); // 密码和确认密码字段都有切换按钮

    fireEvent.click(toggleButtons[0]); // 点击密码字段的切换按钮
    expect(mockOnTogglePassword).toHaveBeenCalled();

    fireEvent.click(toggleButtons[1]); // 点击确认密码字段的切换按钮
    expect(mockOnTogglePassword).toHaveBeenCalledTimes(2);
  });

  it('应该在提交时触发onSubmit', () => {
    render(<RegisterForm {...defaultProps} />);

    const form = screen.getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('在禁用状态下应该禁用所有输入和按钮', () => {
    render(<RegisterForm {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('用户名')).toBeDisabled();
    expect(screen.getByLabelText('邮箱')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
    expect(screen.getByLabelText('确认密码')).toBeDisabled();
    expect(screen.getByRole('button', { name: '注册' })).toBeDisabled();

    const toggleButtons = screen.getAllByTestId('password-visibility-toggle');
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
    };

    render(<RegisterForm {...defaultProps} formData={formData} />);

    expect(screen.getByLabelText('用户名')).toHaveValue('testuser');
    expect(screen.getByLabelText('邮箱')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('密码')).toHaveValue('testpass');
    expect(screen.getByLabelText('确认密码')).toHaveValue('testpass');
  });
});
