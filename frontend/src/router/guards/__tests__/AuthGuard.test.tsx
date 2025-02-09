import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AuthGuard } from '../AuthGuard';
import { useAuth } from '@/hooks/auth';
import Logger from '@/utils/logger';

// Mock hooks and utilities
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: vi.fn()
  };
});

vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn()
  }
}));

describe('AuthGuard', () => {
  const mockNavigate = vi.fn();
  const mockGetCurrentUser = vi.fn();
  const TestChild = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  describe('认证状态处理', () => {
    it('已认证用户应该看到受保护的内容', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        token: 'valid-token',
        getCurrentUser: mockGetCurrentUser
      } as any);

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('未认证用户应该重定向到登录页面', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        token: null,
        getCurrentUser: mockGetCurrentUser
      } as any);

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Token 验证', () => {
    it('有效 token 应该验证用户身份', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 1, username: 'test' });
      
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        token: 'valid-token',
        getCurrentUser: mockGetCurrentUser
      } as any);

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockGetCurrentUser).toHaveBeenCalled();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('无效 token 应该重定向到登录页面', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Invalid token'));
      
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        token: 'invalid-token',
        getCurrentUser: mockGetCurrentUser
      } as any);

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(Logger.error).toHaveBeenCalledWith(
          'Failed to verify auth:',
          expect.any(Object)
        );
      });
    });
  });

  describe('加载状态', () => {
    it('验证过程中应该显示加载状态', () => {
      mockGetCurrentUser.mockImplementation(() => new Promise(() => {})); // 永不解析的 Promise
      
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        token: 'valid-token',
        getCurrentUser: mockGetCurrentUser
      } as any);

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
}); 