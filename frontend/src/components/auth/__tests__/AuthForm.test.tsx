import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AuthForm from '../AuthForm';

describe('AuthForm', () => {
  const mockProps = {
    type: 'login' as const,
    formData: { username: '', password: '' },
    showPassword: false,
    onSubmit: vi.fn(),
    onFormChange: vi.fn(),
    onTogglePassword: vi.fn(),
  };

  it('renders login form correctly', () => {
    render(<AuthForm {...mockProps} />);

    expect(screen.getByRole('heading', { level: 1, name: '登录' })).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('renders register form correctly', () => {
    render(
      <AuthForm
        {...mockProps}
        type="register"
        formData={{
          username: '',
          password: '',
          email: '',
          confirmPassword: '',
        }}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: '注册' })).toBeInTheDocument();
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
  });

  it('handles form submission', () => {
    render(<AuthForm {...mockProps} />);

    const form = screen.getByTestId('auth-form');
    fireEvent.submit(form);
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('handles form changes', () => {
    render(<AuthForm {...mockProps} />);

    fireEvent.change(screen.getByLabelText('用户名'), {
      target: { value: 'testuser' },
    });

    expect(mockProps.onFormChange).toHaveBeenCalledWith({
      username: 'testuser',
    });
  });

  it('toggles password visibility', () => {
    render(<AuthForm {...mockProps} />);

    const toggleButton = screen.getByTestId('password-visibility-toggle');
    fireEvent.click(toggleButton);

    expect(mockProps.onTogglePassword).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<AuthForm {...mockProps} disabled />);

    expect(screen.getByRole('button', { name: '登录' })).toBeDisabled();
    expect(screen.getByLabelText('用户名')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
  });
});
