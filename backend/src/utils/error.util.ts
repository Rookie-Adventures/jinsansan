import { ApiResponse } from '../types/api.response.types';
import { ErrorCode } from '../types/error.codes';

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