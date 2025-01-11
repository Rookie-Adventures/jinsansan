/**
 * 全局类型定义
 */

// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
} 