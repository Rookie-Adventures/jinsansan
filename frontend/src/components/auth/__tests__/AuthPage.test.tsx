import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, beforeEach, vi, type Mock } from 'vitest';

import type { LoginFormData, RegisterFormData } from '@/types/auth';

import { useAuth, useAuthForm } from '@/hooks/auth';
import { waitForAnimation } from '@/test/utils/muiTestHelpers';
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

interface RenderOptions {
  type: 'login' | 'register';
  formData: AuthFormData;
  mockValidation?: {
    isValid: boolean;
    errorMessage?: string;
  };
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

const renderAuthPage = ({ type, formData, mockValidation }: RenderOptions) => {
  if (mockValidation) {
    const validateFn = type === 'login' ? validateLoginForm : validateRegisterForm;
    vi.mocked(validateFn).mockReturnValue(mockValidation);
  }

  vi.mocked(useAuthForm).mockReturnValue(createMockAuthFormHook(formData));

  return render(
    <MemoryRouter>
      <AuthPage type={type} initialData={formData}>
        {type === 'login' ? <LoginForm /> : <RegisterForm />}
      </AuthPage>
    </MemoryRouter>
  );
};

const submitForm = async () => {
  const form = screen.getByTestId('auth-form');
  fireEvent.submit(form);
  await waitForAnimation();
};

const verifySuccessfulSubmission = async (mock: Mock, formData: AuthFormData) => {
  await waitFor(
    () => {
      expect(mock).toHaveBeenCalledWith(formData);
    },
    { timeout: TEST_TIMEOUT }
  );
  await waitForAnimation();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
};

const verifyFailedSubmission = async (errorMessage: string) => {
  await waitFor(
    () => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    },
    { timeout: TEST_TIMEOUT }
  );
  await waitForAnimation();
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('登录功能测试', () => {
    test('登录成功时不应显示错误消息', async () => {
      const formData = createTestFormData('login');
      const { mock } = setupTestEnvironment({ 
        type: 'login', 
        formData, 
        isSuccess: true 
      });

      renderAuthPage({ type: 'login', formData });
      await submitForm();
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

      renderAuthPage({ type: 'login', formData });
      await submitForm();
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

      renderAuthPage({ type: 'register', formData });
      await submitForm();
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

      renderAuthPage({ type: 'register', formData });
      await submitForm();
      await verifyFailedSubmission('用户名已存在');
    });

    test('注册表单验证失败时应显示验证错误', async () => {
      const testFormData: AuthFormData = {
        username: 'test',
        password: '123',
        email: 'invalid-email',
        confirmPassword: '123',
      };

      renderAuthPage({
        type: 'register',
        formData: testFormData,
        mockValidation: {
          isValid: false,
          errorMessage: '密码至少需要6个字符',
        },
      });

      await submitForm();
      await waitFor(
        () => {
          expect(validateRegisterForm).toHaveBeenCalledWith(testFormData);
        },
        { timeout: TEST_TIMEOUT }
      );
      await verifyFailedSubmission('密码至少需要6个字符');
    });
  });

  describe('错误处理测试', () => {
    test('表单提交时应显示验证错误', async () => {
      const formData = createTestFormData('login');
      renderAuthPage({
        type: 'login',
        formData,
        mockValidation: {
          isValid: false,
          errorMessage: '用户名不能为空',
        },
      });

      await submitForm();
      await verifyFailedSubmission('用户名不能为空');
    });

    test('表单重新提交成功后应清除错误消息', async () => {
      const formData = createTestFormData('login');
      const { rerender } = renderAuthPage({
        type: 'login',
        formData,
        mockValidation: {
          isValid: false,
          errorMessage: '用户名不能为空',
        },
      });

      await submitForm();
      await verifyFailedSubmission('用户名不能为空');

      // 重新渲染组件，模拟验证成功
      vi.mocked(validateLoginForm).mockReturnValue({ isValid: true });
      rerender(
        <MemoryRouter>
          <AuthPage type="login" initialData={formData}>
            <LoginForm />
          </AuthPage>
        </MemoryRouter>
      );

      await submitForm();
      await waitFor(
        () => {
          expect(screen.queryByText('用户名不能为空')).not.toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );
    });
  });
});
