# 搜索系统

## 搜索服务

### 功能特性
- 基础搜索
- 高级搜索
- 结果过滤
- 分页支持
- 排序功能

### 接口定义
```typescript
interface SearchParams {
  keyword: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 使用示例
```typescript
// 基础搜索
const searchService = new SearchServiceImpl();
const result = await searchService.search<UserType>({
  keyword: 'test',
  page: 1,
  pageSize: 10
});

// 高级搜索
const advancedResult = await searchService.advancedSearch<UserType>({
  keyword: 'test',
  filters: {
    status: 'active',
    role: 'admin'
  },
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

## 最佳实践
1. 搜索性能优化
2. 结果缓存
3. 关键词处理
4. 错误处理 