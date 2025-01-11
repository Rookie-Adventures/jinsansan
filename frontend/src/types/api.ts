// API 响应的基础接口
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// API 错误接口
export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 过滤参数
export interface FilterParams {
  [key: string]: string | number | boolean | null;
} 