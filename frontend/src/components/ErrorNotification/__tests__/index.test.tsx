import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';

import { HttpError, HttpErrorType } from '@/utils/http/error/types';

import { ErrorNotification } from '../index';

// 测试辅助类型和函数
interface TestConfig {
  error?: HttpError | null;
  onClose?: () => void;
}

interface ErrorData {
  message: string;
}

const getErrorTitle = (type: HttpErrorType): string => {
  switch (type) {
    case HttpErrorType.HTTP_ERROR:
      return '服务器错误';
    case HttpErrorType.AUTH:
      return '认证错误';
    case HttpErrorType.NETWORK_ERROR:
      return '网络错误';
    default:
      return '错误';
  }
};

const createTestError = (overrides: Partial<HttpError> = {}): HttpError => {
  return new HttpError({
    type: HttpErrorType.HTTP_ERROR,
    message: 'Test error message',
    status: 500,
    data: { message: 'Test error detail' } as ErrorData,
    ...overrides,
  });
};

const renderErrorNotification = (config: TestConfig = {}) => {
  const {
    error = null,
    onClose = vi.fn(),
  } = config;

  return {
    onClose,
    ...render(
      <ThemeProvider theme={createTheme()}>
        <ErrorNotification
          error={error}
          onClose={onClose}
        />
      </ThemeProvider>
    ),
  };
};

const verifyErrorDisplay = async (error: HttpError) => {
  // 验证错误标题
  const alert = screen.getByRole('alert');
  const titleElement = within(alert).getByText(getErrorTitle(error.type));
  expect(titleElement).toBeInTheDocument();

  // 验证错误消息
  const messageElement = within(alert).getByText(error.message, { exact: true });
  expect(messageElement).toBeInTheDocument();

  // 验证错误详情
  const errorData = error.data as ErrorData | undefined;
  if (errorData?.message) {
    const detailElement = screen.queryByText(errorData.message);
    expect(detailElement).toBeInTheDocument();
  }

  // 验证错误图标
  const alertIcon = screen.getByTestId('ErrorOutlineIcon');
  expect(alertIcon).toBeInTheDocument();
};

describe('ErrorNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('基础功能', () => {
    it('没有错误时不应该显示通知', () => {
      renderErrorNotification();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('有错误时应该显示错误消息', () => {
      const error = createTestError();
      renderErrorNotification({ error });
      verifyErrorDisplay(error);
    });

    it('应该显示不同类型的错误', async () => {
      const testCases = [
        {
          type: HttpErrorType.AUTH,
          message: '用户未登录',
          status: 401,
          data: { message: '请重新登录' },
        },
        {
          type: HttpErrorType.NETWORK_ERROR,
          message: '网络连接失败',
          status: 0,
          data: { message: '请检查网络连接' },
        },
        {
          type: HttpErrorType.HTTP_ERROR,
          message: '请求失败',
          status: 400,
          data: { message: '输入数据无效' },
        },
      ];

      for (const testCase of testCases) {
        const error = createTestError(testCase);
        const { rerender } = renderErrorNotification({ error });
        await verifyErrorDisplay(error);
        rerender(
          <ThemeProvider theme={createTheme()}>
            <ErrorNotification error={null} onClose={vi.fn()} />
          </ThemeProvider>
        );
      }
    });
  });

  describe('交互功能', () => {
    it('点击关闭按钮应该触发 onClose', () => {
      const error = createTestError();
      const onClose = vi.fn();
      renderErrorNotification({ error, onClose });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('应该在指定时间后自动关闭', async () => {
      const error = createTestError();
      const onClose = vi.fn();

      renderErrorNotification({ error, onClose });

      // 等待自动关闭时间
      vi.runAllTimers();

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('鼠标悬停时不应该自动关闭', async () => {
      const error = createTestError();
      const onClose = vi.fn();

      renderErrorNotification({ error, onClose });

      // 模拟鼠标悬停
      const alert = screen.getByRole('alert');
      fireEvent.mouseEnter(alert);

      // 等待自动关闭时间
      vi.runAllTimers();
      expect(onClose).not.toHaveBeenCalled();

      // 移开鼠标后应该关闭
      fireEvent.mouseLeave(alert);
      vi.runAllTimers();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理缺少错误详情的情况', () => {
      const error = createTestError({ data: undefined });
      renderErrorNotification({ error });
      expect(screen.getByText(error.message)).toBeInTheDocument();
      expect(screen.queryByTestId('error-detail')).not.toBeInTheDocument();
    });

    it('应该处理错误消息为空的情况', () => {
      const error = createTestError({ 
        message: '',
        type: HttpErrorType.HTTP_ERROR 
      });
      renderErrorNotification({ error });
      expect(screen.getByText('服务器处理请求时出错')).toBeInTheDocument();
    });
  });
});
