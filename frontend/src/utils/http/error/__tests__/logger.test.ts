/* eslint-disable no-console */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpError } from '../error';
import { ErrorLogger } from '../logger';
import { HttpErrorType } from '../types';

// 保存原始环境变量
const originalEnv = process.env.NODE_ENV;

describe('ErrorLogger', () => {
  let logger: ErrorLogger;
  const originalConsole = { ...console };

  beforeEach(() => {
    // 设置为开发环境
    process.env.NODE_ENV = 'development';
    // 恢复所有 mock
    vi.restoreAllMocks();
    // 重置单例实例
    ErrorLogger.resetInstance();
    // 获取新实例
    logger = ErrorLogger.getInstance();
    // Mock console methods
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    // 恢复原始 console
    console = { ...originalConsole };
  });

  afterAll(() => {
    // 恢复原始环境变量
    process.env.NODE_ENV = originalEnv;
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ErrorLogger.getInstance();
      const instance2 = ErrorLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('log', () => {
    test('should log critical error with console.error', () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Internal server error',
        status: 500,
        severity: 'critical'
      });

      logger.log(error);
      expect(console.error).toHaveBeenCalled();
    });

    test('should log warning error with console.warn', () => {
      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Bad request',
        status: 400,
        severity: 'warning'
      });

      logger.log(error);
      expect(console.warn).toHaveBeenCalled();
    });

    test('should log info error with console.info', () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network timeout',
        severity: 'info'
      });

      logger.log(error);
      expect(console.info).toHaveBeenCalled();
    });

    test('should include error metadata in log', () => {
      const metadata = {
        userId: '123',
        requestId: 'abc-xyz',
        timestamp: new Date().toISOString()
      };

      const error = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Unauthorized',
        status: 401,
        metadata,
        severity: 'warning'
      });

      logger.log(error);
      
      const expectedMessage = expect.stringMatching(/\[AUTH\].*Unauthorized.*401.*userId: 123.*requestId: abc-xyz/);
      expect(console.warn).toHaveBeenCalledWith(expectedMessage, metadata);
    });
  });

  describe('setLogLevel', () => {
    test('should only log errors above set level', () => {
      logger.setLogLevel('critical');

      const warningError = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Warning message',
        severity: 'warning'
      });

      const criticalError = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Critical error',
        severity: 'critical'
      });

      logger.log(warningError);
      logger.log(criticalError);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addLogHandler', () => {
    test('should call custom log handler', () => {
      const customHandler = vi.fn();
      logger.addLogHandler(customHandler);

      const error = new HttpError({
        type: HttpErrorType.BUSINESS,
        message: 'Business error'
      });

      logger.log(error);
      expect(customHandler).toHaveBeenCalledWith(error);
    });
  });

  describe('formatError', () => {
    test('should format error message with all details', () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Server error',
        status: 500,
        stack: 'Error stack trace',
        metadata: { requestId: 'xyz' }
      });

      const formattedMessage = logger.formatError(error);
      expect(formattedMessage).toContain('Server error');
      expect(formattedMessage).toContain('500');
      expect(formattedMessage).toContain('Error stack trace');
      expect(formattedMessage).toContain('xyz');
    });
  });
}); 