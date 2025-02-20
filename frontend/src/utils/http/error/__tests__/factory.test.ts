import { AxiosError } from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HttpErrorFactory } from '../factory';
import { HttpError, HttpErrorType } from '../types';

interface ExpectedErrorResult {
  type: HttpErrorType;
  message: string;
  code: string;
  status?: number;
  data?: unknown;
  isAxiosError?: boolean;
}

const verifyHttpError = (result: HttpError, expected: ExpectedErrorResult) => {
  expect(result).toBeInstanceOf(HttpError);
  expect(result.type).toBe(expected.type);
  expect(result.message).toBe(expected.message);
  expect(result.code).toBe(expected.code);
  
  if (expected.status !== undefined) {
    expect(result.status).toBe(expected.status);
  }
  if (expected.data !== undefined) {
    expect(result.data).toEqual(expected.data);
  }
  if (expected.isAxiosError !== undefined) {
    expect(result.isAxiosError).toBe(expected.isAxiosError);
  }
};

describe('HttpErrorFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应该直接返回 HttpError 实例', () => {
      const httpError = new HttpError({
        type: HttpErrorType.HTTP_ERROR,
        message: 'Test error',
      });
      const result = HttpErrorFactory.create(httpError);
      expect(result).toBe(httpError);
    });

    it('应该处理 AxiosError', () => {
      const axiosError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: {
          status: 500,
          data: { message: 'Server Error' },
        },
      });

      const result = HttpErrorFactory.create(axiosError as AxiosError);

      verifyHttpError(result, {
        type: HttpErrorType.HTTP_ERROR,
        message: 'Network Error',
        code: 'ECONNABORTED',
        status: 500,
        data: { message: 'Server Error' },
        isAxiosError: true,
      });
    });

    it('应该处理没有响应的 AxiosError', () => {
      const axiosError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: undefined,
      });

      const result = HttpErrorFactory.create(axiosError as AxiosError);

      verifyHttpError(result, {
        type: HttpErrorType.HTTP_ERROR,
        message: 'Network Error',
        code: 'ECONNABORTED',
        status: undefined,
        data: undefined,
        isAxiosError: true,
      });
    });

    it('应该处理普通 Error', () => {
      const error = new Error('Unknown error');
      const result = HttpErrorFactory.create(error);

      verifyHttpError(result, {
        type: HttpErrorType.UNKNOWN_ERROR,
        message: 'Unknown error',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('应该处理自定义错误数据', () => {
      const axiosError = Object.assign(new Error('Validation Error'), {
        isAxiosError: true,
        code: 'ERR_BAD_REQUEST',
        response: {
          status: 400,
          data: {
            code: 'VALIDATION_ERROR',
            fields: {
              username: 'Required',
            },
          },
        },
      });

      const result = HttpErrorFactory.create(axiosError as AxiosError);

      verifyHttpError(result, {
        type: HttpErrorType.HTTP_ERROR,
        message: 'Validation Error',
        code: 'ERR_BAD_REQUEST',
        status: 400,
        data: {
          code: 'VALIDATION_ERROR',
          fields: {
            username: 'Required',
          },
        },
        isAxiosError: true,
      });
    });
  });
});
