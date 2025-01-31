import React, { Suspense, startTransition } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// 创建一个包装了 Promise 的资源
const createResource = (name: string, delay: number) => {
  let status = 'pending';
  let result: string;
  let promise: Promise<string>;

  return {
    read() {
      if (status === 'pending') {
        promise = new Promise<string>(resolve => {
          setTimeout(() => {
            status = 'success';
            result = name;
            resolve(name);
          }, delay);
        });
        throw promise;
      }
      if (status === 'success') {
        return result;
      }
      throw promise;
    },
    reset() {
      status = 'pending';
    },
  };
};

// 模拟异步组件
const createAsyncComponent = (name: string, delay: number) => {
  const resource = createResource(name, delay);
  return function Component() {
    const data = resource.read();
    return <div data-testid={`component-${name}`}>{data}</div>;
  };
};

// 正确的错误边界实现
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-message">Error occurred</div>;
    }
    return this.props.children;
  }
}

describe('Suspense Component Group', () => {
  const AsyncComponent1 = createAsyncComponent('A', 100);
  const AsyncComponent2 = createAsyncComponent('B', 200);
  const AsyncComponent3 = createAsyncComponent('C', 300);

  // 增加等待时间
  const extendedWaitForOptions = { timeout: 3000 };

  it('should render components with loading states', async () => {
    render(
      <div>
        <Suspense fallback={<div>Loading A...</div>}>
          <AsyncComponent1 />
        </Suspense>
        <Suspense fallback={<div>Loading B...</div>}>
          <AsyncComponent2 />
        </Suspense>
        <Suspense fallback={<div>Loading C...</div>}>
          <AsyncComponent3 />
        </Suspense>
      </div>
    );

    // 验证加载状态
    expect(screen.getByText('Loading A...')).toBeInTheDocument();
    expect(screen.getByText('Loading B...')).toBeInTheDocument();
    expect(screen.getByText('Loading C...')).toBeInTheDocument();

    // 等待所有组件加载完成
    await waitFor(() => {
      expect(screen.getByTestId('component-A')).toBeInTheDocument();
      expect(screen.getByTestId('component-B')).toBeInTheDocument();
      expect(screen.getByTestId('component-C')).toBeInTheDocument();
    }, extendedWaitForOptions);

    // 验证组件内容
    expect(screen.getByTestId('component-A')).toHaveTextContent('A');
    expect(screen.getByTestId('component-B')).toHaveTextContent('B');
    expect(screen.getByTestId('component-C')).toHaveTextContent('C');
  });

  it('should handle nested suspense boundaries', async () => {
    // 创建一个延迟更长的资源，确保能看到加载状态
    const resource1 = createResource('A', 300);
    const resource2 = createResource('B', 400);
    const resource3 = createResource('C', 500);

    const AsyncComponent1 = () => {
      const data = resource1.read();
      return <div data-testid="component-A">{data}</div>;
    };

    const AsyncComponent2 = () => {
      const data = resource2.read();
      return <div data-testid="component-B">{data}</div>;
    };

    const AsyncComponent3 = () => {
      const data = resource3.read();
      return <div data-testid="component-C">{data}</div>;
    };

    // 使用 act 包装渲染过程
    act(() => {
      render(
        <Suspense fallback={<div>Loading outer...</div>}>
          <div>
            <AsyncComponent1 />
            <AsyncComponent2 />
            <AsyncComponent3 />
          </div>
        </Suspense>
      );
    });

    // 验证初始加载状态
    expect(screen.getByText('Loading outer...')).toBeInTheDocument();

    // 等待组件逐个加载完成
    await waitFor(() => {
      expect(screen.getByTestId('component-A')).toBeInTheDocument();
    }, extendedWaitForOptions);

    await waitFor(() => {
      expect(screen.getByTestId('component-B')).toBeInTheDocument();
    }, extendedWaitForOptions);

    await waitFor(() => {
      expect(screen.getByTestId('component-C')).toBeInTheDocument();
    }, extendedWaitForOptions);

    // 验证最终内容
    expect(screen.getByTestId('component-A')).toHaveTextContent('A');
    expect(screen.getByTestId('component-B')).toHaveTextContent('B');
    expect(screen.getByTestId('component-C')).toHaveTextContent('C');
  });

  it('should handle errors gracefully', async () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorComponent />
        </Suspense>
      </ErrorBoundary>
    );

    // 验证错误处理
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    }, extendedWaitForOptions);
  });

  it('should work with startTransition', async () => {
    const resource = createResource('A', 500);

    const AsyncComponent = () => {
      const data = resource.read();
      return <div data-testid="component-A">{data}</div>;
    };

    const TestComponent = () => {
      const [show, setShow] = React.useState(false);

      React.useEffect(() => {
        // 重置资源状态
        resource.reset();

        // 使用 act 包装 startTransition
        act(() => {
          startTransition(() => {
            setShow(true);
          });
        });
      }, []);

      if (!show) {
        return null;
      }

      return (
        <Suspense fallback={<div>Loading...</div>}>
          <AsyncComponent />
        </Suspense>
      );
    };

    render(<TestComponent />);

    // 验证加载状态
    await waitFor(
      () => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // 等待组件加载完成
    await waitFor(() => {
      expect(screen.getByTestId('component-A')).toBeInTheDocument();
    }, extendedWaitForOptions);

    // 验证组件内容
    expect(screen.getByTestId('component-A')).toHaveTextContent('A');
  });
});
