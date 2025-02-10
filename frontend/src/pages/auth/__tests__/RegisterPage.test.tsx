import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { useAuth } from '@/hooks/auth';
import type { User } from '@/types/auth';

// Mock hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any),
    useNavigate: vi.fn(),
  };
});

vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    loading: false,
    user: null,
    token: null,
    error: null,
    isAuthenticated: false,
  })),
  useAuthForm: vi.fn(() => ({
    formData: { username: '', password: '', email: '', confirmPassword: '' },
    showPassword: false,
    handleFormChange: vi.fn(),
    togglePasswordVisibility: vi.fn(),
  })),
}));

describe('RegisterPage', () => {
  const mockNavigate = vi.fn();

  const renderRegisterPage = () => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染注册页面', () => {
    renderRegisterPage();

    // 验证页面标题和描述
    expect(screen.getByRole('heading', { name: '注册' })).toBeInTheDocument();
    expect(screen.getByText('创建您的账号')).toBeInTheDocument();

    // 验证表单元素
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();

    // 验证导航链接
    expect(screen.getByText('已有账号？点击登录')).toBeInTheDocument();
  });

  it('在加载状态下应禁用表单', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      loading: true,
      user: null,
      token: null,
      error: null,
      isAuthenticated: false,
    });

    renderRegisterPage();

    expect(screen.getByLabelText('用户名')).toBeDisabled();
    expect(screen.getByLabelText('邮箱')).toBeDisabled();
    expect(screen.getByLabelText('密码')).toBeDisabled();
    expect(screen.getByLabelText('确认密码')).toBeDisabled();
    expect(screen.getByRole('button', { name: '注册' })).toBeDisabled();
  });

  it('已认证用户应重定向到首页', () => {
    const mockUser: User = {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      permissions: [],
    };

    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      loading: false,
      user: mockUser,
      token: 'token',
      error: null,
      isAuthenticated: true,
    });

    renderRegisterPage();

    // 验证重定向逻辑
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
