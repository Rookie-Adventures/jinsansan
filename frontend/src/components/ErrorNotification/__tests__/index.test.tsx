import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorNotification } from '../index';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';
import { errorRecoveryManager } from '@/utils/http/error/recovery';

// Mock errorRecoveryManager
vi.mock('@/utils/http/error/recovery', () => ({
  errorRecoveryManager: {
    attemptRecovery: vi.fn()
  }
}));

describe('ErrorNotification', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // 正确模拟 window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: vi.fn(), href: originalLocation.href }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('当没有错误时不应该渲染任何内容', () => {
      const { container } = render(
        <ErrorNotification error={null} onClose={mockOnClose} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('应该正确渲染网络错误', () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        message: '网络连接失败'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      expect(screen.getByText('网络错误')).toBeInTheDocument();
      expect(screen.getByText('网络连接失败')).toBeInTheDocument();
      expect(screen.getByText('重试')).toBeInTheDocument();
    });

    it('应该正确渲染认证错误', () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: '登录已过期'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      expect(screen.getByText('认证错误')).toBeInTheDocument();
      expect(screen.getByText('登录已过期')).toBeInTheDocument();
      expect(screen.getByText('重新登录')).toBeInTheDocument();
    });

    it('应该使用默认描述当没有错误消息时', () => {
      const error = new HttpError({
        type: HttpErrorType.HTTP_ERROR,
        message: ''
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      expect(screen.getByText('服务器错误')).toBeInTheDocument();
      expect(screen.getByText('服务器处理请求时出错')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理可恢复的错误', async () => {
      vi.mocked(errorRecoveryManager.attemptRecovery).mockResolvedValue(true);

      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        message: '网络错误'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);

      expect(retryButton).toBeDisabled();
      expect(screen.getByText('处理中...')).toBeInTheDocument();

      await waitFor(() => {
        expect(errorRecoveryManager.attemptRecovery).toHaveBeenCalledWith(error);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('应该处理恢复失败的情况', async () => {
      vi.mocked(errorRecoveryManager.attemptRecovery).mockResolvedValue(false);

      const error = new HttpError({
        type: HttpErrorType.NETWORK_ERROR,
        message: '网络错误'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(errorRecoveryManager.attemptRecovery).toHaveBeenCalledWith(error);
        expect(mockOnClose).not.toHaveBeenCalled();
        expect(retryButton).not.toBeDisabled();
        expect(screen.getByText('重试')).toBeInTheDocument();
      });
    });

    it('应该正确处理刷新页面操作', () => {
      const error = new HttpError({
        type: HttpErrorType.REACT_ERROR,
        message: '渲染错误'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('刷新页面'));
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('应该正确处理重新登录操作', () => {
      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: '登录已过期'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      fireEvent.click(screen.getByText('重新登录'));
      expect(window.location.href).toBe('/login');
    });
  });

  describe('自动关闭行为', () => {
    it('错误提示不应该自动关闭', () => {
      const error = new HttpError({
        type: HttpErrorType.HTTP_ERROR,
        message: '严重错误'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);
      
      const alert = screen.getByRole('alert');
      expect(alert.parentElement).toHaveAttribute('data-auto-hide-duration', 'false');
    });

    it('警告信息应该自动关闭', () => {
      const error = new HttpError({
        type: HttpErrorType.UNKNOWN_ERROR,
        message: '警告信息'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);
      
      const alert = screen.getByRole('alert');
      expect(alert.parentElement).toHaveAttribute('data-auto-hide-duration', '6000');
    });
  });

  describe('关闭行为', () => {
    it('应该能通过关闭按钮关闭通知', () => {
      const error = new HttpError({
        type: HttpErrorType.UNKNOWN_ERROR,
        message: '提示信息'
      });

      render(<ErrorNotification error={error} onClose={mockOnClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
}); 