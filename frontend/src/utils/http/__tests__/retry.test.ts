import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { retry, createRetry } from '../retry';
import { AxiosError } from 'axios';

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
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该在失败时重试指定次数', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retry(fn, { times: 3, delay: 1000 });
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('应该在达到最大重试次数后抛出最后一次的错误', async () => {
    const error1 = new Error('fail1');
    const error2 = new Error('fail2');
    const error3 = new Error('fail3');
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2)
      .mockRejectedValue(error3);

    const promise = retry(fn, { times: 3, delay: 1000 });
    await vi.runAllTimersAsync();
    await expect(promise).rejects.toBe(error3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('应该使用指数退避延迟', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
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
    const error = new Error('fail');
    const fn = vi.fn().mockRejectedValue(error);
    await expect(retry(fn, { enable: false })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该根据 shouldRetry 判断是否重试', async () => {
    const error = new Error('fail');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(false);
    
    await expect(retry(fn, { shouldRetry })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error);
  });

  it('应该正确处理 shouldRetry 抛出异常的情况', async () => {
    const error = new Error('fail');
    const shouldRetryError = new Error('shouldRetry error');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockImplementation(() => {
      throw shouldRetryError;
    });
    
    await expect(retry(fn, { shouldRetry })).rejects.toThrow(shouldRetryError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该调用 onRetry 回调并传递正确的参数', async () => {
    const error = new Error('fail');
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    const onRetry = vi.fn();

    const promise = retry(fn, { onRetry, delay: 1000 });
    await vi.runAllTimersAsync();
    const result = await promise;
    
    expect(result).toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(error, 1);
  });

  it('应该在 onRetry 回调抛出异常时继续重试', async () => {
    const error = new Error('fail');
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    const onRetry = vi.fn().mockImplementation(() => {
      throw new Error('onRetry error');
    });

    const promise = retry(fn, { onRetry, delay: 1000 });
    await vi.runAllTimersAsync();
    const result = await promise;
    
    expect(result).toBe('success');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  describe('createRetry', () => {
    it('应该创建一个预配置的重试函数', async () => {
      const retryWithConfig = createRetry({ times: 2, delay: 500 });
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retryWithConfig(fn);
      await vi.runAllTimersAsync();
      const result = await promise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('应该允许覆盖预配置的选项', async () => {
      const retryWithConfig = createRetry({ times: 2, delay: 500, shouldRetry: () => false });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      await expect(retryWithConfig(fn))
        .rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Axios 错误处理', () => {
    it('应该重试网络错误', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;
      networkError.code = 'ECONNABORTED';

      const fn = vi.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const promise = retry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('不应该重试 HTTP 错误响应', async () => {
      const httpError = new Error('Not Found') as AxiosError;
      httpError.isAxiosError = true;
      httpError.response = { status: 404, data: 'Not Found' } as any;

      const fn = vi.fn().mockRejectedValue(httpError);
      await expect(retry(fn)).rejects.toThrow('Not Found');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该重试没有响应的请求错误', async () => {
      const noResponseError = new Error('No Response') as AxiosError;
      noResponseError.isAxiosError = true;
      noResponseError.response = undefined;

      const fn = vi.fn()
        .mockRejectedValueOnce(noResponseError)
        .mockResolvedValue('success');

      const promise = retry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
}); 