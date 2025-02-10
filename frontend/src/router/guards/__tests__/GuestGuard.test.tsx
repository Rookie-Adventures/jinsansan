import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { GuestGuard } from '../GuestGuard';
import { useAuth } from '@/hooks/auth';

// Mock hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any),
    useNavigate: vi.fn(),
  };
});

vi.mock('@/hooks/auth', () => ({
  useAuth: vi.fn(),
}));

describe('GuestGuard', () => {
  const mockNavigate = vi.fn();
  const TestChild = () => <div>Guest Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  describe('访客状态处理', () => {
    it('未认证用户应该看到访客内容', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
      } as any);

      render(
        <MemoryRouter>
          <GuestGuard>
            <TestChild />
          </GuestGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Guest Content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('已认证用户应该重定向到首页', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      render(
        <MemoryRouter>
          <GuestGuard>
            <TestChild />
          </GuestGuard>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
    });
  });

  describe('重定向行为', () => {
    it('认证状态变化时应该触发重定向', async () => {
      // 初始未认证状态
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
      } as any);

      const { rerender } = render(
        <MemoryRouter>
          <GuestGuard>
            <TestChild />
          </GuestGuard>
        </MemoryRouter>
      );

      // 验证初始状态
      await waitFor(() => {
        expect(screen.getByText('Guest Content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();

      // 切换到已认证状态
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
      } as any);

      // 重新渲染
      rerender(
        <MemoryRouter>
          <GuestGuard>
            <TestChild />
          </GuestGuard>
        </MemoryRouter>
      );

      // 验证重定向
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
    });
  });
});
