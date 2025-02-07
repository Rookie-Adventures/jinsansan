import { ErrorReporter } from '../reporter';
import { HttpError } from '../error';
import { HttpErrorType } from '../types';
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';

describe('ErrorReporter', () => {
  let reporter: ErrorReporter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    // 模拟 fetch
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    // 模拟 navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'test-user-agent'
      },
      writable: true
    });

    // 模拟 location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://test.com'
      },
      writable: true
    });
  });

  beforeEach(() => {
    // 重置实例
    ErrorReporter.resetInstance();
    // 创建新实例
    reporter = ErrorReporter.getInstance({
      endpoint: '/test-api/error-report',
      sampleRate: 1.0,
      batchSize: 2,
      flushInterval: 0 // 禁用自动刷新
    });
    // 重置 fetch mock
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(() => {
    ErrorReporter.resetInstance();
  });

  describe('实例管理', () => {
    test('应该维护单例实例', () => {
      const instance1 = ErrorReporter.getInstance();
      const instance2 = ErrorReporter.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('应该能更新实例选项', () => {
      const instance1 = ErrorReporter.getInstance({ endpoint: '/api1' });
      const instance2 = ErrorReporter.getInstance({ endpoint: '/api2' });
      expect(instance1).toBe(instance2);
      // @ts-expect-error 访问私有属性进行测试
      expect(instance2.options.endpoint).toBe('/api2');
    });
  });

  describe('错误报告', () => {
    test('应该正确报告错误', async () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误',
        status: 500,
        code: 'NET_ERR',
        severity: 'error'
      });

      await reporter.report(error);
      await reporter.flushNow();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('/test-api/error-report');
      expect(JSON.parse(options.body)[0].error).toMatchObject({
        name: 'HttpError',
        message: '网络错误',
        type: HttpErrorType.NETWORK,
        status: 500,
        code: 'NET_ERR',
        severity: 'error'
      });
    });

    test('应该根据采样率过滤错误', async () => {
      // 设置采样率为 0
      reporter = ErrorReporter.getInstance({
        sampleRate: 0
      });

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误'
      });

      await reporter.report(error);
      await reporter.flushNow();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('应该批量处理错误', async () => {
      const error1 = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '错误1'
      });

      const error2 = new HttpError({
        type: HttpErrorType.TIMEOUT,
        message: '错误2'
      });

      const error3 = new HttpError({
        type: HttpErrorType.SERVER,
        message: '错误3'
      });

      // 顺序报告错误，避免并发处理
      await reporter.report(error1);
      await reporter.report(error2);
      await reporter.report(error3);
      
      // 手动刷新一次
      await reporter.flushNow();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const firstBatch = JSON.parse(fetchMock.mock.calls[0][1].body);
      const secondBatch = JSON.parse(fetchMock.mock.calls[1][1].body);
      
      expect(firstBatch).toHaveLength(2);
      expect(secondBatch).toHaveLength(1);
      expect(firstBatch[0].error.message).toBe('错误1');
      expect(firstBatch[1].error.message).toBe('错误2');
      expect(secondBatch[0].error.message).toBe('错误3');
    });
  });

  describe('错误处理', () => {
    test('应该处理上报失败的情况', async () => {
      // 创建一个新的实例，设置 maxRetries 为 1
      reporter = ErrorReporter.getInstance({
        endpoint: '/test-api/error-report',
        sampleRate: 1.0,
        batchSize: 2,
        flushInterval: 0,
        maxRetries: 1 // 设置最大重试次数为 1
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '网络错误'
      });

      await reporter.report(error);
      await reporter.flushNow();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reporting failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('应该支持自定义前置处理', async () => {
      reporter = ErrorReporter.getInstance({
        beforeReport: (data) => {
          if (data.error.message.includes('敏感')) {
            return false;
          }
          data.error.message = `处理后: ${data.error.message}`;
          return data;
        }
      });

      const error1 = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '敏感错误'
      });

      const error2 = new HttpError({
        type: HttpErrorType.NETWORK,
        message: '普通错误'
      });

      await reporter.report(error1);
      await reporter.report(error2);
      await reporter.flushNow();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const reportedData = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(reportedData).toHaveLength(1);
      expect(reportedData[0].error.message).toBe('处理后: 普通错误');
    });
  });
}); 