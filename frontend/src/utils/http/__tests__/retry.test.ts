import { vi, expect, describe, it, beforeEach, afterEach, type Mock } from 'vitest';

import type { RetryConfig } from '../retry';

import { retry, createRetry } from '../retry';

// 测试辅助类型和函数
interface RetryTestError extends Error {
  isAxiosError?: boolean;
  code?: string;
  response?: {
    status: number;
    data: unknown;
  };
}

type RetryTestConfig = Partial<RetryConfig>;

const createTestError = (message: string, overrides: Partial<RetryTestError> = {}): RetryTestError => {
  const error = new Error(message) as RetryTestError;
  Object.assign(error, overrides);
  return error;
};

const createAxiosError = (
  message: string,
  overrides: Partial<RetryTestError> = {}
): RetryTestError => {
  return createTestError(message, {
    isAxiosError: true,
    ...overrides,
  });
};

const executeRetryTest = async (
  fn: Mock,
  config?: RetryTestConfig,
  expectedCalls: number = 1
) => {
  const promise = retry(fn, config);
  await vi.runAllTimersAsync();
  return { promise, fn, expectedCalls };
};

const executeRetryFunctionTest = async (
  fn: Mock,
  options: { retries: number; delay: number } = { retries: 3, delay: 1000 }
) => {
  const promise = retry(fn, { times: options.retries, delay: options.delay });
  await vi.runAllTimersAsync();
  return promise;
};

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('应该在成功时直接返回结果', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const { promise, fn: mockFn } = await executeRetryTest(fn);
    const result = await promise;
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该在失败时重试指定次数', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(createTestError('fail'))
      .mockRejectedValueOnce(createTestError('fail'))
      .mockResolvedValue('success');

    const { promise, fn: mockFn } = await executeRetryTest(fn, { times: 3, delay: 1000 }, 3);
    const result = await promise;
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('应该在达到最大重试次数后抛出最后一次的错误', async () => {
    const errors = [
      createTestError('fail1'),
      createTestError('fail2'),
      createTestError('fail3')
    ];

    const fn = vi.fn()
      .mockRejectedValueOnce(errors[0])
      .mockRejectedValueOnce(errors[1])
      .mockRejectedValue(errors[2]);

    const { promise } = await executeRetryTest(fn, { times: 3, delay: 1000 }, 3);
    await expect(promise).rejects.toThrow('fail3');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('应该使用指数退避延迟', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(createTestError('fail'))
      .mockRejectedValueOnce(createTestError('fail'))
      .mockResolvedValue('success');

    const promise = retry(fn, { times: 3, delay: 1000 });

    // 第一次调用
    expect(fn).toHaveBeenCalledTimes(1);

    // 第一次重试 (1000ms)
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(2);

    // 第二次重试 (2000ms)
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe('success');
  });

  it('应该在禁用时不重试', async () => {
    const error = createTestError('fail');
    const fn = vi.fn().mockRejectedValue(error);
    
    await expect(retry(fn, { enable: false })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该根据 shouldRetry 判断是否重试', async () => {
    const error = createTestError('fail');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(retry(fn, { shouldRetry })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error);
  });

  it('应该正确处理 shouldRetry 抛出异常的情况', async () => {
    const error = createTestError('fail');
    const shouldRetryError = createTestError('shouldRetry error');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockImplementation(() => {
      throw shouldRetryError;
    });

    await expect(retry(fn, { shouldRetry })).rejects.toThrow(shouldRetryError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该调用 onRetry 回调并传递正确的参数', async () => {
    const error = createTestError('fail');
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue('success');
    const onRetry = vi.fn();

    const { promise } = await executeRetryTest(fn, { onRetry, delay: 1000 }, 2);
    const result = await promise;

    expect(result).toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(error, 1);
  });

  it('应该在 onRetry 回调抛出异常时继续重试', async () => {
    const error = createTestError('fail');
    const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue('success');
    const onRetry = vi.fn().mockImplementation(() => {
      throw createTestError('onRetry error');
    });

    const { promise } = await executeRetryTest(fn, { onRetry, delay: 1000 }, 2);
    const result = await promise;

    expect(result).toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  describe('createRetry', () => {
    it('应该创建一个预配置的重试函数', async () => {
      const retryWithConfig = createRetry({ times: 2, delay: 500 });
      const fn = vi.fn()
        .mockRejectedValueOnce(createTestError('fail'))
        .mockResolvedValue('success');

      const promise = retryWithConfig(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('应该允许覆盖预配置的选项', async () => {
      const retryWithConfig = createRetry({ times: 2, delay: 500, shouldRetry: () => false });
      const fn = vi.fn().mockRejectedValue(createTestError('fail'));

      await expect(retryWithConfig(fn)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Axios 错误处理', () => {
    it('应该重试网络错误', async () => {
      const networkError = createAxiosError('Network Error', {
        code: 'ECONNABORTED'
      });

      const fn = vi.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const { promise, fn: mockFn } = await executeRetryTest(fn, undefined, 2);
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('不应该重试 HTTP 错误响应', async () => {
      const httpError = createAxiosError('Not Found', {
        response: { status: 404, data: 'Not Found' }
      });

      const fn = vi.fn().mockRejectedValue(httpError);
      await expect(retry(fn)).rejects.toThrow('Not Found');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该重试没有响应的请求错误', async () => {
      const noResponseError = createAxiosError('No Response', {
        response: undefined
      });

      const fn = vi.fn()
        .mockRejectedValueOnce(noResponseError)
        .mockResolvedValue('success');

      const { promise, fn: mockFn } = await executeRetryTest(fn, undefined, 2);
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('retryFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('应该在达到最大重试次数后抛出最后一次的错误', async () => {
    const failingFunction = vi.fn().mockRejectedValue(new Error('fail3'));
    await expect(executeRetryFunctionTest(failingFunction)).rejects.toThrow('fail3');
    expect(failingFunction).toHaveBeenCalledTimes(3);
  });

  test('应该在成功时立即返回结果', async () => {
    const successFunction = vi.fn().mockResolvedValue('success');
    const result = await executeRetryFunctionTest(successFunction);
    expect(result).toBe('success');
    expect(successFunction).toHaveBeenCalledTimes(1);
  });

  test('应该遵守延迟时间', async () => {
    const failingFunction = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');

    const promise = retryFunction(failingFunction, { retries: 3, delay: 1000 });
    expect(failingFunction).toHaveBeenCalledTimes(1);
    
    await vi.advanceTimersByTimeAsync(1000);
    expect(failingFunction).toHaveBeenCalledTimes(2);
    
    await vi.advanceTimersByTimeAsync(1000);
    expect(failingFunction).toHaveBeenCalledTimes(3);
    
    const result = await promise;
    expect(result).toBe('success');
  });
});

// 简单的重试函数实现
async function retryFunction<T>(fn: () => Promise<T> | T, options = { retries: 3, delay: 1000 }): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries - 1) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    }
  }
  
  if (!lastError) {
    throw new Error('Unexpected: No error occurred but retry failed');
  }
  throw lastError;
}
