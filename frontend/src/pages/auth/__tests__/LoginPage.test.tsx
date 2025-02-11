import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import LoginPage from '../LoginPage';
import { mockReactRouterAndAuth, mockAuthLoadingState, mockAuthAuthenticatedState } from '@/test/utils/authTestUtils';
import { renderAuthPage, mockAuthFormHook } from '@/test/utils/authPageTestUtils';

mockReactRouterAndAuth();

vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
  useAuthForm: mockAuthFormHook(),
}));

describe('LoginPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('在加载状态下应禁用表单', () => {
    mockAuthLoadingState();
    renderAuthPage({ component: <LoginPage />, mockNavigate });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('已认证用户应重定向到首页', () => {
    mockAuthAuthenticatedState();
    renderAuthPage({ component: <LoginPage />, mockNavigate });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('应该正确渲染登录页面', () => {
    renderAuthPage({ component: <LoginPage />, mockNavigate });

    // 验证页面标题和描述
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByText('欢迎回来！请登录您的账号')).toBeInTheDocument();

    // 验证表单元素
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();

    // 验证导航链接
    expect(screen.getByText('没有账号？立即注册')).toBeInTheDocument();
  });
});
