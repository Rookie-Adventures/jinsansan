/* eslint-disable no-console */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { errorLogger } from '../../../errorLogger';
import { HttpError } from '../error';
import { ErrorLogger } from '../logger';
import { HttpErrorType } from '../types';

// Mock errorLogger
vi.mock('../../../errorLogger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

describe('ErrorLogger', () => {
  let logger: ErrorLogger;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    ErrorLogger.resetInstance();
    logger = ErrorLogger.getInstance();
  });

  afterAll(() => {
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
    test('should log critical error with errorLogger', () => {
      const error = new HttpError({
        type: HttpErrorType.SERVER,
        message: 'Internal server error',
        status: 500,
        severity: 'critical'
      });

      logger.log(error);
      expect(errorLogger.log).toHaveBeenCalledWith(error, { level: 'error' });
    });

    test('should log warning error with errorLogger', () => {
      const error = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Bad request',
        status: 400,
        severity: 'warning'
      });

      logger.log(error);
      expect(errorLogger.log).toHaveBeenCalledWith(error, { level: 'warn' });
    });

    test('should log info error with errorLogger', () => {
      const error = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network timeout',
        severity: 'info'
      });

      logger.log(error);
      expect(errorLogger.log).toHaveBeenCalledWith(error, { level: 'info' });
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
      expect(errorLogger.log).toHaveBeenCalledWith(error, { level: 'warn', context: metadata });
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

      expect(errorLogger.log).toHaveBeenCalledTimes(1);
      expect(errorLogger.log).toHaveBeenCalledWith(criticalError, { level: 'error' });
    });
  });

  describe('addLogHandler', () => {
    test('should call custom log handler', () => {
      const customHandler = vi.fn();
      logger.addLogHandler(customHandler);

      const error = new HttpError({
        type: HttpErrorType.BUSINESS,
        message: 'Business error',
        severity: 'warning'
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