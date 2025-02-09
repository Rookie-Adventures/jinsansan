import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import ErrorNotification from '../ErrorNotification';

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
      render(<ErrorNotification />);
      
      await act(async () => {
        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            message: '测试消息',
            type: 'error',
            position: 'top',
            duration: 5000
          }
        }));
      });

      expect(screen.getByText('测试消息')).toBeInTheDocument();
    });

    it('应该在指定时间后自动关闭通知', async () => {
      render(<ErrorNotification />);
      
      await act(async () => {
        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: {
            message: '测试消息',
            type: 'error',
            position: 'top',
            duration: 2000
          }
        }));
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
      render(<ErrorNotification />);
      
      for (const type of ['error', 'warning', 'info']) {
        await act(async () => {
          window.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
              message: `${type}消息`,
              type: type as 'error' | 'warning' | 'info',
              position: 'top',
              duration: 5000
            }
          }));
        });

        expect(screen.getByText(`${type}消息`)).toBeInTheDocument();
      }
    });

    it('应该支持不同位置的通知', async () => {
      render(<ErrorNotification />);
      
      for (const position of ['top', 'bottom']) {
        await act(async () => {
          window.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
              message: `${position}消息`,
              type: 'info',
              position: position as 'top' | 'bottom',
              duration: 5000
            }
          }));
        });

        const alert = screen.getByText(`${position}消息`).closest('.MuiSnackbar-root');
        expect(alert).toHaveClass(`MuiSnackbar-anchorOrigin${position.charAt(0).toUpperCase() + position.slice(1)}Center`);
      }
    });
  });

  describe('错误对话框测试', () => {
    it('应该正确显示错误对话框', async () => {
      render(<ErrorNotification />);
      
      await act(async () => {
        window.dispatchEvent(new CustomEvent('show-error-modal', {
          detail: {
            title: '错误标题',
            message: '错误消息'
          }
        }));
      });

      expect(screen.getByText('错误标题')).toBeInTheDocument();
      expect(screen.getByText('错误消息')).toBeInTheDocument();
    });

    it('在开发环境下应该显示错误详情', async () => {
      process.env.NODE_ENV = 'development';
      
      render(<ErrorNotification />);
      
      await act(async () => {
        const error = new Error('详细错误信息');
        window.dispatchEvent(new CustomEvent('show-error-modal', {
          detail: {
            title: '错误标题',
            message: '错误消息',
            error: error
          }
        }));
      });

      expect(screen.getByText('详细错误信息')).toBeInTheDocument();
    });

    it('在生产环境下不应该显示错误详情', async () => {
      process.env.NODE_ENV = 'production';
      
      render(<ErrorNotification />);
      
      await act(async () => {
        const error = new Error('详细错误信息');
        window.dispatchEvent(new CustomEvent('show-error-modal', {
          detail: {
            title: '错误标题',
            message: '错误消息',
            error: error
          }
        }));
      });

      expect(screen.queryByText('详细错误信息')).not.toBeInTheDocument();
    });

    it('应该能正确处理不同类型的错误对象', async () => {
      process.env.NODE_ENV = 'development';
      
      render(<ErrorNotification />);
      
      const testCases = [
        { error: new Error('错误对象'), expected: '错误对象' },
        { error: '字符串错误', expected: '字符串错误' },
        { error: { custom: 'error' }, expected: JSON.stringify({ custom: 'error' }, null, 2) }
      ];

      for (const { error, expected } of testCases) {
        await act(async () => {
          window.dispatchEvent(new CustomEvent('show-error-modal', {
            detail: {
              title: '错误标题',
              message: '错误消息',
              error: error
            }
          }));
        });

        const errorText = screen.getByText((content) => 
          content.includes(expected.replace(/\s+/g, ' ').trim())
        );
        expect(errorText).toBeInTheDocument();
      }
    });

    it('点击关闭按钮应该关闭对话框', async () => {
      render(<ErrorNotification />);
      
      await act(async () => {
        window.dispatchEvent(new CustomEvent('show-error-modal', {
          detail: {
            title: '错误标题',
            message: '错误消息'
          }
        }));
      });

      const closeButton = screen.getByText('关闭');
      await act(async () => {
        fireEvent.click(closeButton);
      });

      // 等待动画完成
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByText('错误标题')).not.toBeInTheDocument();
    });

    it('点击刷新按钮应该重新加载页面', async () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true
      });

      render(<ErrorNotification />);
      
      await act(async () => {
        window.dispatchEvent(new CustomEvent('show-error-modal', {
          detail: {
            title: '错误标题',
            message: '错误消息'
          }
        }));
      });

      const refreshButton = screen.getByText('刷新页面');
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('事件监听器清理测试', () => {
    it('应该在组件卸载时移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<ErrorNotification />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('show-notification', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('show-error-modal', expect.any(Function));
    });
  });
}); 