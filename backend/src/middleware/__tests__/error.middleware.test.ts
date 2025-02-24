import { describe, it, expect, vi } from 'vitest';
import { errorMiddleware } from '../error.middleware';
import { ErrorCode } from '../../types/error.codes';

interface CustomError extends Error {
  status?: number;
}

describe('errorMiddleware', () => {
  it('should handle error with message', () => {
    const err = new Error('测试错误');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.INTERNAL_ERROR,
      message: '测试错误',
      data: null,
      timestamp: expect.any(Number)
    });
  });

  it('should handle error without message', () => {
    const err = new Error();
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.INTERNAL_ERROR,
      message: '内部服务器错误',
      data: null,
      timestamp: expect.any(Number)
    });
  });

  it('should handle error with custom status', () => {
    const err = new Error('未授权') as CustomError;
    err.status = 401;
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.INTERNAL_ERROR,
      message: '未授权',
      data: null,
      timestamp: expect.any(Number)
    });
  });
}); 