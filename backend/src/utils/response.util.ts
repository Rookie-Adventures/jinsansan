import { ApiResponse, ErrorCode } from '../types/api.response.types';

export class ResponseUtil {
  static success<T>(data: T): ApiResponse<T> {
    return {
      code: ErrorCode.SUCCESS,
      message: '成功',
      data,
      timestamp: Date.now(),
    };
  }

  static error(code: number, message: string): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    };
  }
} 