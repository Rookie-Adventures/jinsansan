import { describe, it, expect } from 'vitest';
import { ResponseUtil } from '../response.util';
import { ErrorCode } from '../../types/error.codes';

describe('ResponseUtil', () => {
  it('should create success response', () => {
    const data = { id: 1, name: 'test' };
    const response = ResponseUtil.success(data);

    expect(response).toEqual({
      code: ErrorCode.SUCCESS,
      message: '成功',
      data: data,
      timestamp: expect.any(Number)
    });
  });

  it('should create error response', () => {
    const message = '错误信息';
    const response = ResponseUtil.error(ErrorCode.NOT_FOUND, message);

    expect(response).toEqual({
      code: ErrorCode.NOT_FOUND,
      message: message,
      data: null,
      timestamp: expect.any(Number)
    });
  });
}); 