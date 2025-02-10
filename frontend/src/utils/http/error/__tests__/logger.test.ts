import { vi, describe, it, expect, beforeEach } from 'vitest';
import { errorLogger } from '../logger';
import { HttpError, HttpErrorType } from '../types';
import Logger from '@/utils/logger';

// Mock Logger
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('errorLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确记录 HTTP 错误', () => {
    const error = new HttpError({
      type: HttpErrorType.HTTP_ERROR,
      message: 'API request failed',
      code: 'ERR_BAD_REQUEST',
      status: 400,
      data: { field: 'username', error: 'Required' },
    });

    errorLogger.log(error);

    expect(Logger.error).toHaveBeenCalledWith('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: 'ERR_BAD_REQUEST',
        message: 'API request failed',
        status: 400,
        data: { field: 'username', error: 'Required' },
        stack: error.stack,
      },
    });
  });

  it('应该处理认证错误', () => {
    const error = new HttpError({
      type: HttpErrorType.AUTH,
      message: '认证失败',
      code: 'UNAUTHORIZED',
      status: 401,
    });

    errorLogger.log(error);

    expect(Logger.error).toHaveBeenCalledWith('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: 'UNAUTHORIZED',
        message: '认证失败',
        status: 401,
        data: undefined,
        stack: error.stack,
      },
    });
  });

  it('应该处理网络错误', () => {
    const error = new HttpError({
      type: HttpErrorType.NETWORK_ERROR,
      message: '网络连接失败',
      code: 'NETWORK_ERROR',
    });

    errorLogger.log(error);

    expect(Logger.error).toHaveBeenCalledWith('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败',
        status: undefined,
        data: undefined,
        stack: error.stack,
      },
    });
  });

  it('应该处理未知错误', () => {
    const error = new HttpError({
      type: HttpErrorType.UNKNOWN_ERROR,
      message: '未知错误',
      code: 'UNKNOWN_ERROR',
      data: { detail: 'Something went wrong' },
    });

    errorLogger.log(error);

    expect(Logger.error).toHaveBeenCalledWith('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: 'UNKNOWN_ERROR',
        message: '未知错误',
        status: undefined,
        data: { detail: 'Something went wrong' },
        stack: error.stack,
      },
    });
  });

  it('应该处理带有完整错误信息的错误', () => {
    const error = new HttpError({
      type: HttpErrorType.HTTP_ERROR,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      status: 422,
      data: {
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' },
        ],
      },
    });

    errorLogger.log(error);

    expect(Logger.error).toHaveBeenCalledWith('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        status: 422,
        data: {
          errors: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Password too short' },
          ],
        },
        stack: error.stack,
      },
    });
  });
});
