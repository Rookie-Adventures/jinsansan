import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { HttpErrorFactory } from '../factory';
import { HttpError, HttpErrorType } from '../types';

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

      expect(result).toBeInstanceOf(HttpError);
      expect(result.type).toBe(HttpErrorType.HTTP_ERROR);
      expect(result.message).toBe('Network Error');
      expect(result.code).toBe('ECONNABORTED');
      expect(result.status).toBe(500);
      expect(result.data).toEqual({ message: 'Server Error' });
      expect(result.isAxiosError).toBe(true);
    });

    it('应该处理没有响应的 AxiosError', () => {
      const axiosError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: undefined,
      });

      const result = HttpErrorFactory.create(axiosError as AxiosError);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.type).toBe(HttpErrorType.HTTP_ERROR);
      expect(result.message).toBe('Network Error');
      expect(result.code).toBe('ECONNABORTED');
      expect(result.status).toBeUndefined();
      expect(result.data).toBeUndefined();
      expect(result.isAxiosError).toBe(true);
    });

    it('应该处理普通 Error', () => {
      const error = new Error('Unknown error');
      const result = HttpErrorFactory.create(error);

      expect(result).toBeInstanceOf(HttpError);
      expect(result.type).toBe(HttpErrorType.UNKNOWN_ERROR);
      expect(result.message).toBe('Unknown error');
      expect(result.code).toBe('UNKNOWN_ERROR');
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

      expect(result).toBeInstanceOf(HttpError);
      expect(result.type).toBe(HttpErrorType.HTTP_ERROR);
      expect(result.message).toBe('Validation Error');
      expect(result.code).toBe('ERR_BAD_REQUEST');
      expect(result.status).toBe(400);
      expect(result.data).toEqual({
        code: 'VALIDATION_ERROR',
        fields: {
          username: 'Required',
        },
      });
    });
  });
});
