import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, beforeEach, vi, type Mock } from 'vitest';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

import { useAuth, useAuthForm } from '@/hooks/auth';
import { validateLoginForm, validateRegisterForm } from '@/utils/auth/validation';

import AuthPage from '../AuthPage';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';

// 测试配置
const TEST_TIMEOUT = 7000;

// 测试类型和辅助函数
interface AuthFormData extends Partial<LoginFormData & RegisterFormData> {
  username: string;
  password: string;
}

interface MockAuthOptions {
  mockFn?: Mock;
  isSuccess: boolean;
  errorMessage?: string;
}

interface TestSetupOptions extends MockAuthOptions {
  type: 'login' | 'register';
  formData: AuthFormData;
}

const createTestFormData = (type: 'login' | 'register'): AuthFormData => {
  const baseData = {
    username: 'testuser',
    password: 'password123',
  };
  return type === 'login' 
    ? baseData 
    : { ...baseData, email: 'test@example.com', confirmPassword: 'password123' };
};

const setupMockAuth = (options: MockAuthOptions) => {
  const { mockFn, isSuccess, errorMessage = '操作失败' } = options;
  const mock = mockFn || vi.fn();
  if (isSuccess) {
    mock.mockResolvedValue(undefined);
  } else {
    mock.mockRejectedValue(new Error(errorMessage));
  }
  return mock;
};

const setupTestEnvironment = (options: TestSetupOptions) => {
  const { type, formData, ...mockOptions } = options;
  const mock = setupMockAuth(mockOptions);
  
  const mockOverrides = type === 'login' 
    ? { login: mock }
    : { register: mock };
  
  vi.mocked(useAuth).mockReturnValue(createMockAuthHook(mockOverrides));
  vi.mocked(useAuthForm).mockReturnValue(createMockAuthFormHook(formData));
  
  if (type === 'register') {
    vi.mocked(validateRegisterForm).mockReturnValue({
      isValid: options.isSuccess,
      errorMessage: options.isSuccess ? undefined : options.errorMessage,
    });
  }
  
  return { mock };
};

const submitForm = () => {
  const form = screen.getByTestId('auth-form');
  fireEvent.submit(form);
};

const verifySuccessfulSubmission = async (mock: Mock, formData: AuthFormData) => {
  await waitFor(
    () => {
      expect(mock).toHaveBeenCalledWith(formData);
    },
    { timeout: TEST_TIMEOUT }
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
};

const verifyFailedSubmission = async (errorMessage: string) => {
  await waitFor(
    () => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    },
    { timeout: TEST_TIMEOUT }
  );
};

// 基础 mock 函数
const createMockAuthHook = (overrides = {}) => ({
  login: vi.fn(),
  register: vi.fn(),
  loading: false,
  user: null,
  token: null,
  error: null,
  isAuthenticated: false,
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  ...overrides,
});

const createMockAuthFormHook = (formData: AuthFormData) => ({
  formData,
  showPassword: false,
  handleFormChange: vi.fn(),
  togglePasswordVisibility: vi.fn(),
});

// Mock hooks
vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(() => createMockAuthHook()),
  useAuthForm: vi.fn(() => createMockAuthFormHook({ username: '', password: '' })),
}));

// Mock validation
vi.mock('@/utils/auth/validation', () => ({
  validateLoginForm: vi.fn(() => ({ isValid: true })),
  validateRegisterForm: vi.fn(() => ({ isValid: true })),
}));

describe('AuthPage', () => {
  const renderAuthPage = (
    type: 'login' | 'register',
    initialData: AuthFormData = { username: '', password: '' }
  ) => {
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
      const formData = createTestFormData('login');
      const { mock } = setupTestEnvironment({ 
        type: 'login', 
        formData, 
        isSuccess: true 
      });

      renderAuthPage('login', formData);
      submitForm();
      await verifySuccessfulSubmission(mock, formData);
    });

    test('登录失败时应显示错误消息', async () => {
      const formData = createTestFormData('login');
      setupTestEnvironment({ 
        type: 'login', 
        formData, 
        isSuccess: false,
        errorMessage: '用户名或密码错误' 
      });

      renderAuthPage('login', formData);
      submitForm();
      await verifyFailedSubmission('用户名或密码错误');
    });
  });

  describe('注册功能测试', () => {
    test('注册成功时不应显示错误消息', async () => {
      const formData = createTestFormData('register');
      const { mock } = setupTestEnvironment({ 
        type: 'register', 
        formData, 
        isSuccess: true 
      });

      renderAuthPage('register', formData);
      submitForm();
      await verifySuccessfulSubmission(mock, formData);
    });

    test('注册失败时应显示错误消息', async () => {
      const formData = createTestFormData('register');
      setupTestEnvironment({ 
        type: 'register', 
        formData, 
        isSuccess: false,
        errorMessage: '用户名已存在' 
      });

      renderAuthPage('register', formData);
      submitForm();
      await verifyFailedSubmission('用户名已存在');
    });

    test('注册表单验证失败时应显示验证错误', async () => {
      const testFormData: AuthFormData = {
        username: 'test',
        password: '123',
        email: 'invalid-email',
        confirmPassword: '123',
      };

      vi.mocked(validateRegisterForm).mockReturnValue({
        isValid: false,
        errorMessage: '密码至少需要6个字符',
      });

      vi.mocked(useAuthForm).mockReturnValue(createMockAuthFormHook(testFormData));

      renderAuthPage('register', testFormData);

      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      await waitFor(
        () => {
          expect(validateRegisterForm).toHaveBeenCalledWith(testFormData);
        },
        { timeout: TEST_TIMEOUT }
      );

      await waitFor(
        () => {
          expect(screen.getByText('密码至少需要6个字符')).toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );
    });
  });

  describe('错误处理测试', () => {
    const setupErrorTest = () => {
      vi.mocked(validateLoginForm).mockReturnValue({
        isValid: false,
        errorMessage: '用户名不能为空',
      });

      const testFormData: AuthFormData = {
        username: '',
        password: '',
      };

      renderAuthPage('login', testFormData);
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);

      return { errorMessage: '用户名不能为空' };
    };

    const verifyErrorMessagePresent = async () => {
      await waitFor(
        () => {
          expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );
    };

    const verifyErrorMessageAbsent = async () => {
      await waitFor(
        () => {
          expect(screen.queryByText('用户名不能为空')).not.toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );
    };

    test('错误消息应该在6秒后自动关闭', async () => {
      setupErrorTest();
      await verifyErrorMessagePresent();
      
      await new Promise(resolve => setTimeout(resolve, 6000));
      await verifyErrorMessageAbsent();
    }, 10000);

    test('点击关闭按钮应该关闭错误消息', async () => {
      setupErrorTest();
      await verifyErrorMessagePresent();

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      await verifyErrorMessageAbsent();
    });
  });
});
