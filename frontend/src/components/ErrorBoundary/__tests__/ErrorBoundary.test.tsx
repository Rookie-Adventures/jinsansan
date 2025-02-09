import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorBoundary from '../index';
import { errorLogger } from '@/utils/http/error/logger';
import { HttpErrorType } from '@/utils/http/error/types';

// Mock errorLogger
vi.mock('@/utils/http/error/logger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

describe('ErrorBoundary', () => {
  const ErrorChild = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('should render fallback UI when error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorChild />
      </ErrorBoundary>
    );
    expect(getByText('出错了')).toBeInTheDocument();
    expect(getByText('Test error')).toBeInTheDocument();
  });

  it('should render default fallback when no custom fallback provided', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorChild />
      </ErrorBoundary>
    );
    expect(getByText('重试')).toBeInTheDocument();
  });

  it('should log error when error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorChild />
      </ErrorBoundary>
    );
    expect(errorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HttpErrorType.REACT_ERROR,
        message: 'Test error'
      })
    );
  });

  it('should call onReset when retry button clicked', () => {
    const onReset = vi.fn();
    const { getByText } = render(
      <ErrorBoundary onReset={onReset}>
        <ErrorChild />
      </ErrorBoundary>
    );
    fireEvent.click(getByText('重试'));
    expect(onReset).toHaveBeenCalled();
  });

  it('should reset error state when onReset called', async () => {
    let shouldError = true;
    const TestComponent = () => {
      if (shouldError) {
        throw new Error('Test error');
      }
      return <div>Recovered</div>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(getByText('出错了')).toBeInTheDocument();
    
    // 修改状态，使组件不再抛出错误
    shouldError = false;
    
    // 点击重试按钮
    await act(async () => {
      fireEvent.click(getByText('重试'));
    });

    // 验证组件已恢复
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
  });

  it('should include component stack in error log', () => {
    render(
      <ErrorBoundary>
        <ErrorChild />
      </ErrorBoundary>
    );
    expect(errorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          componentStack: expect.any(String)
        })
      })
    );
  });

  it('should handle multiple errors', async () => {
    const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
      if (shouldError) {
        throw new Error('Test error');
      }
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldError={true} />
      </ErrorBoundary>
    );

    // 验证初始错误状态
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // 准备新的组件状态
    rerender(
      <ErrorBoundary>
        <TestComponent shouldError={false} />
      </ErrorBoundary>
    );

    // 点击重试按钮触发恢复
    fireEvent.click(screen.getByText('重试'));

    // 验证恢复后的状态
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();

    // 再次触发错误
    rerender(
      <ErrorBoundary>
        <TestComponent shouldError={true} />
      </ErrorBoundary>
    );

    // 验证再次出现错误
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
}); 