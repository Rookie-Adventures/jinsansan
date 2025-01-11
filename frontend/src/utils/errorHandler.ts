import { AxiosError } from 'axios';

import type { ApiError } from '@/types/api';

// 处理 API 错误
export function handleApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return error.response.data;
  }
  
  return {
    code: error.response?.status || 500,
    message: error.message || '未知错误',
  };
}

// 获取错误消息
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return handleApiError(error).message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '未知错误';
}

// 检查是否是网络错误
export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}

// 检查是否是认证错误
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof AxiosError && 
    (error.response?.status === 401 || error.response?.status === 403)
  );
} 