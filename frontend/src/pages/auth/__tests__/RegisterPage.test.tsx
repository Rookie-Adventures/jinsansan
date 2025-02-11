import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import RegisterPage from '../RegisterPage';
import { mockReactRouterAndAuth, mockAuthLoadingState, mockAuthAuthenticatedState } from '@/test/utils/authTestUtils';
import { renderAuthPage, mockAuthFormHook } from '@/test/utils/authPageTestUtils';

mockReactRouterAndAuth();

vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
  useAuthForm: mockAuthFormHook({
    email: '',
    confirmPassword: ''
  }),
}));

describe('RegisterPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染注册页面', () => {
    renderAuthPage({ component: <RegisterPage />, mockNavigate });

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
    mockAuthLoadingState();
    renderAuthPage({ component: <RegisterPage />, mockNavigate });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('已认证用户应重定向到首页', () => {
    mockAuthAuthenticatedState();
    renderAuthPage({ component: <RegisterPage />, mockNavigate });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
