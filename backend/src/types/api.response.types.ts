import { ErrorCode } from './error.codes';

export interface ApiResponse<T> {
  code: ErrorCode;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
} 