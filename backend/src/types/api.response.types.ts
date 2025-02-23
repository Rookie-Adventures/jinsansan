export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export { ErrorCode } from './error.codes'; 