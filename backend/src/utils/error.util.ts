import { ApiResponse, ErrorCode } from '../types/api.response.types';

export class ErrorUtil {
  static handleError(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    };
  }
} 