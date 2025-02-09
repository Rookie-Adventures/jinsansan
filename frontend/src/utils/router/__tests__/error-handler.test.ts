import { vi, describe, it, expect, beforeEach } from 'vitest';
import { routerErrorHandler } from '../error-handler';
import { errorLogger } from '@/utils/error/errorLogger';
import { ErrorLevel } from '@/types/error';

// Mock errorLogger
vi.mock('@/utils/error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

describe('RouterErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('应该处理 404 错误', () => {
      const error = new Error('Page not found');
      Object.assign(error, { status: 404 });

      routerErrorHandler.handleError(error, { path: '/not-found' });

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      // 验证第一次调用 - 记录原始错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        error,
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            path: '/not-found',
            status: 404
          })
        })
      );
      // 验证第二次调用 - 记录格式化的 404 错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: expect.stringContaining('Route not found')
        }),
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 404
          })
        })
      );
    });

    it('应该处理 403 错误', () => {
      const error = new Error('Access denied');
      Object.assign(error, { status: 403, data: { reason: 'unauthorized' } });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(3);
      // 验证第一次调用 - 记录原始错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        error,
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 403
          })
        })
      );
      // 验证第二次调用 - 记录格式化的 403 错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: expect.stringContaining('Access forbidden')
        }),
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 403,
            errorData: { reason: 'unauthorized' }
          })
        })
      );
      // 验证第三次调用 - 记录警告
      expect(errorLogger.log).toHaveBeenNthCalledWith(3,
        expect.any(Error),
        expect.objectContaining({
          level: ErrorLevel.WARN
        })
      );
    });

    it('应该处理未知错误', () => {
      const error = new Error('Unknown error');

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      // 验证第一次调用 - 记录原始错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        error,
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 500
          })
        })
      );
      // 验证第二次调用 - 记录严重错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        error,
        expect.objectContaining({
          level: ErrorLevel.CRITICAL,
          context: expect.objectContaining({
            isCritical: true,
            timestamp: expect.any(Number)
          })
        })
      );
    });

    it('应该处理非 Error 对象', () => {
      const error = 'String error message';

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      // 验证第一次调用 - 记录原始错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        expect.any(Error),
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 500
          })
        })
      );
      // 验证第二次调用 - 记录严重错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.any(Error),
        expect.objectContaining({
          level: ErrorLevel.CRITICAL,
          context: expect.objectContaining({
            isCritical: true,
            timestamp: expect.any(Number)
          })
        })
      );
    });

    it('应该处理带有额外数据的错误', () => {
      const error = new Error('Complex error');
      Object.assign(error, {
        data: {
          code: 'INTERNAL_ERROR',
          details: 'Something went wrong'
        }
      });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      // 验证第一次调用 - 记录原始错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        error,
        expect.objectContaining({
          level: ErrorLevel.ERROR,
          context: expect.objectContaining({
            status: 500
          })
        })
      );
      // 验证第二次调用 - 记录严重错误
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        error,
        expect.objectContaining({
          level: ErrorLevel.CRITICAL,
          context: expect.objectContaining({
            isCritical: true,
            timestamp: expect.any(Number)
          })
        })
      );
    });

    it('应该处理 null 或 undefined 错误', () => {
      routerErrorHandler.handleError(null);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          message: 'null'
        }),
        expect.objectContaining({
          level: 'error'
        })
      );
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