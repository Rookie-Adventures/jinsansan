import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { errorLogger } from '../errorLogger';
import type { LogContext, LogLevel } from '../errorLogger';

describe('ErrorLogger', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalConsole = { ...console };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 重置环境为开发环境
    process.env.NODE_ENV = 'development';

    // 重置 ErrorLogger 实例
    (errorLogger as any).instance = undefined;

    // 模拟 fetch
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    // 模拟 console 方法
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // 模拟 localStorage
    const mockStorage: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key]),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      }),
      key: vi.fn((index: number) => Object.keys(mockStorage)[index]),
      length: 0
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
    Object.assign(console, originalConsole);
  });

  describe('单例模式', () => {
    it('应该维护单例实例', () => {
      const instance1 = errorLogger;
      const instance2 = errorLogger;
      expect(instance1).toBe(instance2);
    });
  });

  describe('开发环境日志', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('应该在开发环境下输出调试日志', async () => {
      const error = new Error('调试错误');
      const context = { level: 'debug' as LogLevel };
      await errorLogger.log(error, context);
      expect(console.debug).toHaveBeenCalledWith(error.message, context);
    });

    it('应该在开发环境下输出信息日志', async () => {
      const error = new Error('信息错误');
      const context = { level: 'info' as LogLevel };
      await errorLogger.log(error, context);
      expect(console.info).toHaveBeenCalledWith(error.message, context);
    });

    it('应该在开发环境下输出警告日志', async () => {
      const error = new Error('警告错误');
      const context = { level: 'warn' as LogLevel };
      await errorLogger.log(error, context);
      expect(console.warn).toHaveBeenCalledWith(error.message, context);
    });

    it('应该在开发环境下输出错误日志', async () => {
      const error = new Error('严重错误');
      const context = { level: 'error' as LogLevel };
      await errorLogger.log(error, context);
      expect(console.error).toHaveBeenCalledWith(error.message, context);
    });

    it('应该在开发环境下输出严重错误日志', async () => {
      const error = new Error('严重错误');
      const context = { level: 'critical' as LogLevel };
      await errorLogger.log(error, context);
      expect(console.error).toHaveBeenCalledWith(error.message, context);
    });
  });

  describe('生产环境日志', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('不应该在生产环境下输出控制台日志', async () => {
      const error = new Error('测试错误');
      await errorLogger.log(error, { level: 'error' });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('应该发送日志到服务器', async () => {
      const error = new Error('测试错误');
      const context: LogContext = {
        level: 'error',
        context: { userId: '123' }
      };

      await errorLogger.log(error, context);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/logs'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
        })
      );

      const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(body).toEqual({
        message: '测试错误',
        stack: error.stack,
        level: 'error',
        timestamp: expect.any(Number),
        context: { userId: '123' }
      });
    });
  });

  describe('错误处理', () => {
    it('应该在服务器请求失败时保存到本地存储', async () => {
      fetchMock.mockRejectedValueOnce(new Error('网络错误'));

      const error = new Error('测试错误');
      await errorLogger.log(error, { level: 'error' });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining('测试错误')
      );
    });

    it('应该在服务器返回非 200 状态码时保存到本地存储', async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

      const error = new Error('测试错误');
      await errorLogger.log(error, { level: 'error' });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'error_logs',
        expect.stringContaining('测试错误')
      );
    });

    it('应该在本地存储已有日志时追加新日志', async () => {
      const existingLog = {
        message: '已存在的错误',
        level: 'error',
        timestamp: Date.now(),
        context: {}
      };
      vi.spyOn(localStorage, 'getItem').mockReturnValueOnce(JSON.stringify([existingLog]));

      fetchMock.mockRejectedValueOnce(new Error('网络错误'));

      const error = new Error('新错误');
      await errorLogger.log(error, { level: 'error' });

      const setItemCall = vi.mocked(localStorage.setItem).mock.calls[0];
      const savedLogs = JSON.parse(setItemCall[1]);
      
      expect(savedLogs).toHaveLength(2);
      expect(savedLogs[0]).toEqual(existingLog);
      expect(savedLogs[1]).toMatchObject({
        message: '新错误',
        level: 'error'
      });
    });

    it('应该在本地存储失败时不抛出错误', async () => {
      vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('存储错误');
      });

      fetchMock.mockRejectedValueOnce(new Error('网络错误'));

      const error = new Error('测试错误');
      await expect(errorLogger.log(error, { level: 'error' }))
        .resolves
        .not.toThrow();
    });
  });
}); 