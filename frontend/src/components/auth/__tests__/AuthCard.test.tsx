import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import AuthCard from '../AuthCard';

describe('AuthCard', () => {
  describe('渲染测试', () => {
    test('应该正确渲染子组件', () => {
      render(
        <AuthCard>
          <div data-testid="test-child">Test Content</div>
        </AuthCard>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('当提供 onToLogin 时应该显示登录链接', () => {
      const onToLogin = vi.fn();
      render(<AuthCard onToLogin={onToLogin}>Test Content</AuthCard>);

      const loginLink = screen.getByText('已有账号？点击登录');
      expect(loginLink).toBeInTheDocument();
    });

    test('当提供 onToRegister 时应该显示注册链接', () => {
      const onToRegister = vi.fn();
      render(<AuthCard onToRegister={onToRegister}>Test Content</AuthCard>);

      const registerLink = screen.getByText('没有账号？立即注册');
      expect(registerLink).toBeInTheDocument();
    });

    test('当没有提供回调函数时不应该显示对应链接', () => {
      render(<AuthCard>Test Content</AuthCard>);

      expect(screen.queryByText('已有账号？点击登录')).not.toBeInTheDocument();
      expect(screen.queryByText('没有账号？立即注册')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    test('点击登录链接应该触发 onToLogin 回调', () => {
      const onToLogin = vi.fn();
      render(<AuthCard onToLogin={onToLogin}>Test Content</AuthCard>);

      const loginLink = screen.getByText('已有账号？点击登录');
      fireEvent.click(loginLink);

      expect(onToLogin).toHaveBeenCalledTimes(1);
    });

    test('点击注册链接应该触发 onToRegister 回调', () => {
      const onToRegister = vi.fn();
      render(<AuthCard onToRegister={onToRegister}>Test Content</AuthCard>);

      const registerLink = screen.getByText('没有账号？立即注册');
      fireEvent.click(registerLink);

      expect(onToRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('样式测试', () => {
    test('应该应用正确的布局样式', () => {
      render(<AuthCard>Test Content</AuthCard>);

      const container = screen.getByText('Test Content').closest('.MuiBox-root');
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      });
    });

    test('卡片应该有正确的最大宽度', () => {
      render(<AuthCard>Test Content</AuthCard>);

      const card = screen.getByText('Test Content').closest('.MuiCard-root');
      expect(card).toHaveStyle({
        maxWidth: '400px',
      });
    });
  });

  describe('可访问性测试', () => {
    test('链接应该可以通过键盘访问和有正确的 ARIA 属性', () => {
      const onToLogin = vi.fn();
      const onToRegister = vi.fn();

      render(
        <AuthCard onToLogin={onToLogin} onToRegister={onToRegister}>
          Test Content
        </AuthCard>
      );

      const loginLink = screen.getByText('已有账号？点击登录');
      const registerLink = screen.getByText('没有账号？立即注册');

      expect(loginLink).toHaveAttribute('role', 'button');
      expect(registerLink).toHaveAttribute('role', 'button');
    });
  });
});
