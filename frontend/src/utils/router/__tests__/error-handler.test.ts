import { vi, describe, it, expect, beforeEach } from 'vitest';
import { routerErrorHandler } from '../error-handler';
import { errorLogger } from '@/utils/error/errorLogger';

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
      expect(errorLogger.log).toHaveBeenNthCalledWith(1, 
        error,
        expect.objectContaining({
          level: 'error',
          context: {
            path: '/not-found',
            status: 404
          }
        })
      );
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: 'Route not found: Page not found'
        }),
        expect.objectContaining({
          level: 'error',
          context: {
            status: 404,
            errorData: undefined
          }
        })
      );
    });

    it('应该处理 403 错误', () => {
      const error = new Error('Access denied');
      Object.assign(error, { status: 403, data: { reason: 'unauthorized' } });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: 'Access forbidden: Access denied'
        }),
        expect.objectContaining({
          level: 'error',
          context: {
            status: 403,
            errorData: { reason: 'unauthorized' }
          }
        })
      );
    });

    it('应该处理未知错误', () => {
      const error = new Error('Unknown error');
      Object.assign(error, { status: 500 });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: 'Unknown router error: Unknown error'
        }),
        expect.objectContaining({
          level: 'error',
          context: {
            status: 500,
            errorData: undefined
          }
        })
      );
    });

    it('应该处理非 Error 对象', () => {
      const error = 'String error message';

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      expect(errorLogger.log).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          message: 'String error message'
        }),
        expect.objectContaining({
          level: 'error',
          context: {
            status: undefined
          }
        })
      );
    });

    it('应该处理带有额外数据的错误', () => {
      const error = new Error('Complex error');
      Object.assign(error, {
        status: 500,
        data: {
          code: 'INTERNAL_ERROR',
          details: 'Something went wrong'
        }
      });

      routerErrorHandler.handleError(error);

      expect(errorLogger.log).toHaveBeenCalledTimes(2);
      expect(errorLogger.log).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          message: 'Unknown router error: Complex error'
        }),
        expect.objectContaining({
          level: 'error',
          context: {
            status: 500,
            errorData: {
              code: 'INTERNAL_ERROR',
              details: 'Something went wrong'
            }
          }
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