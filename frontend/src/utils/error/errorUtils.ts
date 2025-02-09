import { LogData } from '@/infrastructure/logging/types';

/**
 * 将任意错误转换为 Error 对象
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 将错误转换为日志数据
 */
export function toLogData(error: unknown): LogData {
  const err = toError(error);
  return {
    error: err.message,
    stack: err.stack,
    timestamp: Date.now()
  };
} 