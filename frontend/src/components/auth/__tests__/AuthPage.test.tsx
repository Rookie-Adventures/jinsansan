import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from '../AuthPage';
import type { LoginFormData, RegisterFormData } from '@/types/auth';
import { useAuth, useAuthForm } from '@/hooks/auth';
import { validateLoginForm, validateRegisterForm } from '@/utils/auth/validation';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';

// 测试配置
const TEST_TIMEOUT = 7000;

// 测试类型定义
interface AuthFormData extends Partial<LoginFormData & RegisterFormData> {
  username: string;
  password: string;
}

// Mock hooks
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
    loading: false,
    user: null,
    token: null,
    error: null,
    isAuthenticated: false,
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  })),
  useAuthForm: vi.fn(() => ({
    formData: { username: '', password: '' } as AuthFormData,
    showPassword: false,
    handleFormChange: vi.fn(),
    togglePasswordVisibility: vi.fn()
  }))
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn()
  }
}));

// Mock validation
vi.mock('@/utils/auth/validation', () => ({
  validateLoginForm: vi.fn(() => ({ isValid: true })),
  validateRegisterForm: vi.fn(() => ({ isValid: true }))
}));

describe('AuthPage', () => {
  const renderAuthPage = (type: 'login' | 'register', initialData: AuthFormData = { username: '', password: '' }) => {
    return render(
      <MemoryRouter>
        <AuthPage type={type} initialData={initialData}>
          {type === 'login' ? <LoginForm /> : <RegisterForm />}
        </AuthPage>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('登录功能测试', () => {
    test('登录成功时不应显示错误消息', async () => {
      const mockLogin = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useAuth).mockReturnValue({
        login: mockLogin,
        register: vi.fn(),
        loading: false,
        user: null,
        token: null,
        error: null,
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn()
      });

      const testFormData: AuthFormData = { 
        username: 'testuser', 
        password: 'password123' 
      };

      vi.mocked(useAuthForm).mockReturnValue({
        formData: testFormData,
        showPassword: false,
        handleFormChange: vi.fn(),
        togglePasswordVisibility: vi.fn()
      });

      renderAuthPage('login', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(testFormData);
      }, { timeout: TEST_TIMEOUT });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('登录失败时应显示错误消息', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('用户名或密码错误'));
      vi.mocked(useAuth).mockReturnValue({
        login: mockLogin,
        register: vi.fn(),
        loading: false,
        user: null,
        token: null,
        error: null,
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn()
      });

      const testFormData: AuthFormData = { 
        username: 'testuser', 
        password: 'wrongpass' 
      };

      vi.mocked(useAuthForm).mockReturnValue({
        formData: testFormData,
        showPassword: false,
        handleFormChange: vi.fn(),
        togglePasswordVisibility: vi.fn()
      });

      renderAuthPage('login', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });
    });
  });

  describe('注册功能测试', () => {
    test('注册成功时不应显示错误消息', async () => {
      const mockRegister = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useAuth).mockReturnValue({
        login: vi.fn(),
        register: mockRegister,
        loading: false,
        user: null,
        token: null,
        error: null,
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn()
      });

      const testFormData: AuthFormData = { 
        username: 'newuser', 
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123'
      };

      vi.mocked(validateRegisterForm).mockReturnValue({
        isValid: true,
        errorMessage: undefined
      });

      vi.mocked(useAuthForm).mockReturnValue({
        formData: testFormData,
        showPassword: false,
        handleFormChange: vi.fn(),
        togglePasswordVisibility: vi.fn()
      });

      renderAuthPage('register', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(validateRegisterForm).toHaveBeenCalledWith(testFormData);
        expect(mockRegister).toHaveBeenCalledWith(testFormData);
      }, { timeout: TEST_TIMEOUT });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('注册失败时应显示错误消息', async () => {
      const mockRegister = vi.fn().mockRejectedValue(new Error('用户名已存在'));
      vi.mocked(useAuth).mockReturnValue({
        login: vi.fn(),
        register: mockRegister,
        loading: false,
        user: null,
        token: null,
        error: null,
        isAuthenticated: false,
        logout: vi.fn(),
        getCurrentUser: vi.fn()
      });

      const testFormData: AuthFormData = {
        username: 'existinguser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123'
      };

      vi.mocked(validateRegisterForm).mockReturnValue({
        isValid: true,
        errorMessage: undefined
      });

      vi.mocked(useAuthForm).mockReturnValue({
        formData: testFormData,
        showPassword: false,
        handleFormChange: vi.fn(),
        togglePasswordVisibility: vi.fn()
      });

      renderAuthPage('register', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(validateRegisterForm).toHaveBeenCalledWith(testFormData);
        expect(screen.getByText('用户名已存在')).toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });
    });

    test('注册表单验证失败时应显示验证错误', async () => {
      const testFormData: AuthFormData = {
        username: 'test',
        password: '123',  // 密码太短
        email: 'invalid-email',  // 无效的邮箱
        confirmPassword: '123'
      };

      vi.mocked(validateRegisterForm).mockReturnValue({
        isValid: false,
        errorMessage: '密码至少需要6个字符'
      });

      vi.mocked(useAuthForm).mockReturnValue({
        formData: testFormData,
        showPassword: false,
        handleFormChange: vi.fn(),
        togglePasswordVisibility: vi.fn()
      });

      renderAuthPage('register', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(validateRegisterForm).toHaveBeenCalledWith(testFormData);
        expect(screen.getByText('密码至少需要6个字符')).toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });
    });
  });

  describe('错误处理测试', () => {
    test('错误消息应该在6秒后自动关闭', async () => {
      vi.mocked(validateLoginForm).mockReturnValue({
        isValid: false,
        errorMessage: '用户名不能为空'
      });

      const testFormData: AuthFormData = {
        username: '',
        password: ''
      };

      renderAuthPage('login', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });

      await new Promise((resolve) => setTimeout(resolve, 6000));
      
      await waitFor(() => {
        expect(screen.queryByText('用户名不能为空')).not.toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });
    }, 10000);

    test('点击关闭按钮应该关闭错误消息', async () => {
      vi.mocked(validateLoginForm).mockReturnValue({
        isValid: false,
        errorMessage: '用户名不能为空'
      });

      const testFormData: AuthFormData = {
        username: '',
        password: ''
      };

      renderAuthPage('login', testFormData);
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('用户名不能为空')).not.toBeInTheDocument();
      }, { timeout: TEST_TIMEOUT });
    });
  });
}); 