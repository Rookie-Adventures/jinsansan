import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ErrorLevel } from '@/types/error';
import { errorLogger } from '@/utils/error/errorLogger';

import { routerErrorHandler } from '../error-handler';

// 测试辅助类型和函数
interface TestError extends Error {
  status?: number;
  data?: Record<string, unknown>;
}

const createTestError = (message: string, overrides: Partial<TestError> = {}): TestError => {
  const error = new Error(message) as TestError;
  Object.assign(error, overrides);
  return error;
};

// Mock errorLogger
vi.mock('@/utils/error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// 添加验证辅助函数
interface ErrorLogContext {
  message?: string;
  level: ErrorLevel;
  context?: Record<string, unknown>;
}

const verifyErrorLog = (
  callIndex: number,
  expectedMessage: string | Error,
  expectedLog: Partial<ErrorLogContext>
) => {
  expect(errorLogger.log).toHaveBeenNthCalledWith(
    callIndex,
    expectedMessage instanceof Error ? expectedMessage : expect.objectContaining({
      message: expect.stringContaining(expectedMessage),
    }),
    expect.objectContaining({
      level: expectedLog.level,
      ...(expectedLog.context && { context: expectedLog.context }),
    })
  );
};

describe('RouterErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('应该处理 404 错误', () => {
      const error = createTestError('Page not found', { status: 404 });
      const testPath = '/not-found';

      routerErrorHandler.handleError(error, { path: testPath });

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      
      // 验证原始错误日志
      verifyErrorLog(1, 'Page not found', {
        level: ErrorLevel.ERROR,
        context: {
          path: testPath,
          status: 404,
        },
      });

      // 验证格式化的 404 错误日志
      verifyErrorLog(2, 'Route not found', {
        level: ErrorLevel.ERROR,
        context: {
          status: 404,
        },
      });
    });

    it('应该处理 403 错误', () => {
      const error = createTestError('Access denied', { 
        status: 403, 
        data: { reason: 'unauthorized' } 
      });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(3);
      
      // 验证原始错误日志
      verifyErrorLog(1, 'Access denied', {
        level: ErrorLevel.ERROR,
        context: {
          status: 403,
        },
      });

      // 验证格式化的 403 错误日志
      verifyErrorLog(2, 'Access forbidden', {
        level: ErrorLevel.ERROR,
        context: {
          status: 403,
          errorData: { reason: 'unauthorized' },
        },
      });

      // 验证警告日志
      verifyErrorLog(3, 'Access forbidden for path', {
        level: ErrorLevel.WARN,
      });
    });

    it('应该处理未知错误', () => {
      const error = createTestError('Unknown error');

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      
      // 验证原始错误日志
      verifyErrorLog(1, 'Unknown error', {
        level: ErrorLevel.ERROR,
        context: {
          status: 500,
        },
      });

      // 验证严重错误日志
      verifyErrorLog(2, 'Unknown error', {
        level: ErrorLevel.CRITICAL,
        context: {
          isCritical: true,
          timestamp: expect.any(Number),
        },
      });
    });

    it('应该处理非 Error 对象', () => {
      const errorMessage = 'String error message';

      routerErrorHandler.handleError(errorMessage);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      
      // 验证原始错误日志
      verifyErrorLog(1, errorMessage, {
        level: ErrorLevel.ERROR,
        context: {
          status: 500,
        },
      });

      // 验证严重错误日志
      verifyErrorLog(2, errorMessage, {
        level: ErrorLevel.CRITICAL,
        context: {
          isCritical: true,
          timestamp: expect.any(Number),
        },
      });
    });

    it('应该处理带有额外数据的错误', () => {
      const error = createTestError('Complex error', {
        data: {
          code: 'INTERNAL_ERROR',
          details: 'Something went wrong',
        },
      });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      
      // 验证原始错误日志
      verifyErrorLog(1, 'Complex error', {
        level: ErrorLevel.ERROR,
        context: {
          status: 500,
        },
      });

      // 验证严重错误日志
      verifyErrorLog(2, 'Complex error', {
        level: ErrorLevel.CRITICAL,
        context: {
          isCritical: true,
          timestamp: expect.any(Number),
        },
      });
    });

    it('应该处理 null 或 undefined 错误', () => {
      routerErrorHandler.handleError(null);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      
      // 验证原始错误日志
      verifyErrorLog(1, 'null', {
        level: ErrorLevel.ERROR,
        context: {
          status: 500,
        },
      });

      // 验证严重错误日志
      verifyErrorLog(2, 'null', {
        level: ErrorLevel.CRITICAL,
        context: {
          isCritical: true,
          timestamp: expect.any(Number),
        },
      });
    });
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = routerErrorHandler;
      const instance2 = routerErrorHandler;
      expect(instance1).toBe(instance2);
    });
  });
});
