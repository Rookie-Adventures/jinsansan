import { ApiResponse } from '../types/api.response.types';
import { ErrorCode } from '../types/error.codes';

export class ResponseUtil {
  static success<T>(data: T, message = '成功'): ApiResponse<T> {
    return {
      code: ErrorCode.SUCCESS,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static error(code: ErrorCode, message: string): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    };
  }
} 