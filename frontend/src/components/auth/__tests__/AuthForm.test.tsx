// 第三方库导入
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// 类型导入
import type { LoginFormData, RegisterFormData } from '@/types/auth';

// 工具导入
import { setupTestComponent } from '@/tests/utils/test-utils';

// 组件导入
import AuthForm from '../AuthForm';

describe('AuthForm', () => {
  const mockLoginProps = {
    type: 'login' as const,
    formData: { username: '', password: '' } as LoginFormData,
    showPassword: false,
    onSubmit: vi.fn(),
    onFormChange: vi.fn(),
    onTogglePassword: vi.fn(),
  };

  const mockRegisterProps = {
    ...mockLoginProps,
    type: 'register' as const,
    formData: {
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
    } as RegisterFormData,
  };

  describe('登录表单', () => {
    it('应该正确渲染登录表单', () => {
      const { getByRole, getByLabelText } = setupTestComponent(<AuthForm {...mockLoginProps} />);
  
      expect(getByRole('heading', { level: 1, name: '登录' })).toBeInTheDocument();
      expect(getByLabelText('用户名')).toBeInTheDocument();
      expect(getByLabelText('密码')).toBeInTheDocument();
      expect(getByRole('button', { name: '登录' })).toBeInTheDocument();
    });

    it('应该处理表单提交', () => {
      const { getByTestId } = setupTestComponent(<AuthForm {...mockLoginProps} />);
  
      const form = getByTestId('auth-form');
      fireEvent.submit(form);
      expect(mockLoginProps.onSubmit).toHaveBeenCalled();
    });

    it('应该处理表单变更', () => {
      const { getByLabelText } = setupTestComponent(<AuthForm {...mockLoginProps} />);
  
      fireEvent.change(getByLabelText('用户名'), {
        target: { value: 'testuser' },
      });
  
      expect(mockLoginProps.onFormChange).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('应该切换密码可见性', () => {
      const { getByTestId } = setupTestComponent(<AuthForm {...mockLoginProps} />);
  
      const toggleButton = getByTestId('password-visibility-toggle');
      fireEvent.click(toggleButton);
  
      expect(mockLoginProps.onTogglePassword).toHaveBeenCalled();
    });

    it('应该处理禁用状态', () => {
      const { getByRole, getByLabelText } = setupTestComponent(
        <AuthForm {...mockLoginProps} disabled />
      );
  
      expect(getByRole('button', { name: '登录' })).toBeDisabled();
      expect(getByLabelText('用户名')).toBeDisabled();
      expect(getByLabelText('密码')).toBeDisabled();
    });
  });

  describe('注册表单', () => {
    it('应该正确渲染注册表单', () => {
      const { getByRole, getByLabelText } = setupTestComponent(
        <AuthForm {...mockRegisterProps} />
      );
  
      expect(getByRole('heading', { level: 1, name: '注册' })).toBeInTheDocument();
      expect(getByLabelText('用户名')).toBeInTheDocument();
      expect(getByLabelText('邮箱')).toBeInTheDocument();
      expect(getByLabelText('密码')).toBeInTheDocument();
      expect(getByLabelText('确认密码')).toBeInTheDocument();
      expect(getByRole('button', { name: '注册' })).toBeInTheDocument();
    });

    it('应该处理注册表单变更', () => {
      const { getByLabelText } = setupTestComponent(<AuthForm {...mockRegisterProps} />);
  
      fireEvent.change(getByLabelText('邮箱'), {
        target: { value: 'test@example.com' },
      });
  
      expect(mockRegisterProps.onFormChange).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('应该处理确认密码变更', () => {
      const { getByLabelText } = setupTestComponent(<AuthForm {...mockRegisterProps} />);
  
      fireEvent.change(getByLabelText('确认密码'), {
        target: { value: 'password123' },
      });
  
      expect(mockRegisterProps.onFormChange).toHaveBeenCalledWith({
        confirmPassword: 'password123',
      });
    });
  });
});
