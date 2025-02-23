export interface PageQuery {
  page: number;        // 当前页码
  pageSize: number;    // 每页大小
  sortBy?: string;     // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方式
} 