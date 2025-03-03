/**
 * 统一响应格式
 */
export interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 消息
  data: T;            // 数据
  timestamp: number;   // 时间戳
}

/**
 * API 错误接口
 */
export interface ApiError {
  code: number;        // 错误码
  message: string;     // 错误消息
  details?: Record<string, unknown>; // 错误详情
} 