import { HttpErrorType } from '@/utils/http/error/types';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary } from '../index';

const mockLog = vi.fn();
const mockLogger = {
  log: mockLog
};

// 模拟 ErrorLogger
vi.mock('@/utils/http/error/logger', () => ({
  ErrorLogger: {
    getInstance: () => mockLogger
  }
}));

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // 使用 vi.spyOn 来监听 console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // 恢复 console.error
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  test('should render children when no error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    
    expect(container).toHaveTextContent('Normal content');
  });

  test('should render fallback UI when error occurs', () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(container).toHaveTextContent('Error occurred');
  });

  test('should render default fallback when no custom fallback provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('出错了')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  test('should log error when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({
      type: HttpErrorType.REACT_ERROR,
      message: 'Test error'
    }));
  });

  test('should call onReset when retry button clicked', () => {
    const onReset = vi.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText('重试');
    retryButton.click();
    
    expect(onReset).toHaveBeenCalled();
  });

  test('should reset error state when onReset called', () => {
    let shouldThrow = true;
    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Normal content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    expect(screen.getByText('出错了')).toBeInTheDocument();

    shouldThrow = false;
    const retryButton = screen.getByText('重试');
    retryButton.click();
    rerender(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  test('should include component stack in error log', () => {
    render(
      <ErrorBoundary>
        <div>
          <ThrowError />
        </div>
      </ErrorBoundary>
    );
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HttpErrorType.REACT_ERROR,
        message: 'Test error',
        data: expect.objectContaining({
          componentStack: expect.any(String)
        })
      })
    );
  });

  test('should handle multiple errors', () => {
    const ThrowMultipleErrors = () => {
      throw new Error('Multiple errors');
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();

    const retryButton = screen.getByText('重试');
    retryButton.click();

    rerender(
      <ErrorBoundary>
        <ThrowMultipleErrors />
      </ErrorBoundary>
    );

    expect(screen.getByText('Multiple errors')).toBeInTheDocument();
  });
}); 