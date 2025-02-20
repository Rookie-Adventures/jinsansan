import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

import { runTimersAndAnimation } from '@/test/utils/testHelpers';

import ErrorNotificationComponent from '../ErrorNotification';

/**
 * 测试辅助函数：触发错误通知事件
 */
const triggerErrorModal = async (detail: {
  title: string;
  message: string;
  error?: unknown;
}) => {
  await act(async () => {
    window.dispatchEvent(
      new CustomEvent('show-error-modal', { detail })
    );
  });
};

/**
 * 测试辅助函数：渲染组件并触发错误
 */
const renderAndTriggerError = async (detail: {
  title: string;
  message: string;
  error?: unknown;
}) => {
  render(<ErrorNotificationComponent />);
  await triggerErrorModal(detail);
};

describe('ErrorNotification', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('通知栏测试', () => {
    it('应该正确显示通知消息', async () => {
      render(<ErrorNotificationComponent />);

      await act(async () => {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              message: '测试消息',
              type: 'error',
              position: 'top',
              duration: 5000,
            },
          })
        );
      });

      expect(screen.getByText('测试消息')).toBeInTheDocument();
    });

    it('应该在指定时间后自动关闭通知', async () => {
      render(<ErrorNotificationComponent />);

      await act(async () => {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              message: '测试消息',
              type: 'error',
              position: 'top',
              duration: 2000,
            },
          })
        );
      });

      expect(screen.getByText('测试消息')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      await act(async () => {
        // 等待动画完成
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByText('测试消息')).not.toBeInTheDocument();
    });

    it('应该支持不同类型的通知', async () => {
      render(<ErrorNotificationComponent />);

      for (const type of ['error', 'warning', 'info']) {
        await act(async () => {
          window.dispatchEvent(
            new CustomEvent('show-notification', {
              detail: {
                message: `${type}消息`,
                type: type as 'error' | 'warning' | 'info',
                position: 'top',
                duration: 5000,
              },
            })
          );
        });

        expect(screen.getByText(`${type}消息`)).toBeInTheDocument();
      }
    });

    it('应该支持不同位置的通知', async () => {
      render(<ErrorNotificationComponent />);

      for (const position of ['top', 'bottom']) {
        await act(async () => {
          window.dispatchEvent(
            new CustomEvent('show-notification', {
              detail: {
                message: `${position}消息`,
                type: 'info',
                position: position as 'top' | 'bottom',
                duration: 5000,
              },
            })
          );
        });

        // 验证消息内容
        const alert = screen.getByRole('alert', { name: `${position}消息` });
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('data-position', position);

        // 验证 Snackbar 位置
        const snackbar = screen.getByRole('presentation', { name: `${position} notification` });
        expect(snackbar).toHaveClass(
          `MuiSnackbar-anchorOrigin${position.charAt(0).toUpperCase() + position.slice(1)}Center`
        );
      }
    });
  });

  describe('错误对话框测试', () => {
    it('应该正确显示错误对话框', async () => {
      await renderAndTriggerError({
        title: '错误标题',
        message: '错误消息',
      });

      expect(screen.getByText('错误标题')).toBeInTheDocument();
      expect(screen.getByText('错误消息')).toBeInTheDocument();
    });

    it('在开发环境下应该显示错误详情', async () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('详细错误信息');

      await renderAndTriggerError({
        title: '错误标题',
        message: '错误消息',
        error,
      });

      expect(screen.getByText('详细错误信息')).toBeInTheDocument();
    });

    it('在生产环境下不应该显示错误详情', async () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('详细错误信息');

      await renderAndTriggerError({
        title: '错误标题',
        message: '错误消息',
        error,
      });

      expect(screen.queryByText('详细错误信息')).not.toBeInTheDocument();
    });

    it('应该能正确处理不同类型的错误对象', async () => {
      process.env.NODE_ENV = 'development';
      render(<ErrorNotificationComponent />);

      const testCases = [
        { error: new Error('错误对象'), expected: '错误对象' },
        { error: '字符串错误', expected: '字符串错误' },
        { error: { custom: 'error' }, expected: JSON.stringify({ custom: 'error' }, null, 2) },
      ];

      for (const { error, expected } of testCases) {
        await triggerErrorModal({
          title: '错误标题',
          message: '错误消息',
          error,
        });

        const errorText = screen.getByText(content =>
          content.includes(expected.replace(/\s+/g, ' ').trim())
        );
        expect(errorText).toBeInTheDocument();
      }
    });

    it('点击关闭按钮应该关闭对话框', async () => {
      await renderAndTriggerError({
        title: '错误标题',
        message: '错误消息',
      });

      const closeButton = screen.getByRole('button', { name: '关闭' });
      await runTimersAndAnimation(() => {
        fireEvent.click(closeButton);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('点击刷新按钮应该重新加载页面', async () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      await renderAndTriggerError({
        title: '错误标题',
        message: '错误消息',
      });

      const refreshButton = screen.getByText('刷新页面');
      fireEvent.click(refreshButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('事件监听器清理测试', () => {
    it('应该在组件卸载时移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<ErrorNotificationComponent />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'show-notification',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith('show-error-modal', expect.any(Function));
    });
  });
});
