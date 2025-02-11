import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { GuestGuard } from '../GuestGuard';
import { mockReactRouterAndAuth, mockAuthLoadingState, mockAuthAuthenticatedState, renderWithAuth } from '@/test/utils/authTestUtils';

mockReactRouterAndAuth();

describe('GuestGuard', () => {
  const TestChild = () => <div>Guest Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('访客状态处理', () => {
    it('未认证用户应该看到访客内容', () => {
      mockAuthLoadingState();

      renderWithAuth({
        component: <GuestGuard><TestChild /></GuestGuard>
      });

      expect(screen.getByText('Guest Content')).toBeInTheDocument();
    });

    it('已认证用户应该重定向到首页', async () => {
      const mockNavigate = vi.fn();
      mockAuthAuthenticatedState();

      renderWithAuth({
        component: <GuestGuard><TestChild /></GuestGuard>,
        mockNavigate
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
    });
  });

  describe('重定向行为', () => {
    it('认证状态变化时应该触发重定向', async () => {
      const mockNavigate = vi.fn();
      
      // 初始未认证状态
      mockAuthLoadingState();

      const { rerender } = renderWithAuth({
        component: <GuestGuard><TestChild /></GuestGuard>,
        mockNavigate
      });

      // 验证初始状态
      expect(screen.getByText('Guest Content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();

      // 切换到已认证状态
      mockAuthAuthenticatedState();

      // 重新渲染
      rerender(<GuestGuard><TestChild /></GuestGuard>);

      // 验证重定向
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
    });
  });
});
