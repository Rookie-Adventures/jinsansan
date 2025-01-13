# 搜索服务

## 概述

搜索服务提供了统一的搜索功能接口，支持基础搜索和高级搜索，包括关键词搜索、过滤、排序等功能。

## 核心功能

### 1. 搜索参数定义

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

### 2. 搜索服务实现

```typescript
class SearchService<T> {
  constructor(private readonly apiClient: HttpClient) {}

  async search(params: SearchParams): Promise<SearchResult<T>> {
    const response = await this.apiClient.get('/search', {
      params,
      cache: {
        enable: true,
        ttl: 5 * 60 * 1000, // 5分钟缓存
      },
    });
    return response.data;
  }

  async advancedSearch(params: SearchParams): Promise<SearchResult<T>> {
    return this.apiClient.post('/search/advanced', params);
  }
}
```

## 组件实现

### 1. 搜索栏组件

```typescript
interface SearchBarProps<T> {
  onSearchResult: (result: SearchResult<T>) => void;
  placeholder?: string;
  debounceTime?: number;
}

export function SearchBar<T>({
  onSearchResult,
  placeholder = '搜索...',
  debounceTime = 500,
}: SearchBarProps<T>) {
  const [keyword, setKeyword] = useState('');
  const searchService = useSearchService<T>();

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) return;
      
      const result = await searchService.search({
        keyword: value,
        page: 1,
        pageSize: 10,
      });
      
      onSearchResult(result);
    }, debounceTime),
    [onSearchResult, searchService]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={keyword}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
```

### 2. 高级搜索组件

```typescript
interface AdvancedSearchProps<T> {
  onSearch: (params: SearchParams) => Promise<void>;
  filters: Array<{
    field: keyof T;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: Array<{ label: string; value: any }>;
  }>;
}

export function AdvancedSearch<T>({
  onSearch,
  filters,
}: AdvancedSearchProps<T>) {
  const [params, setParams] = useState<SearchParams>({
    keyword: '',
    filters: {},
    page: 1,
    pageSize: 10,
  });

  const handleFilterChange = (field: keyof T, value: any) => {
    setParams((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value,
      },
    }));
  };

  const handleSearch = async () => {
    await onSearch(params);
  };

  return (
    <div className="advanced-search">
      {filters.map((filter) => (
        <div key={String(filter.field)} className="filter-item">
          <label>{filter.label}</label>
          {filter.type === 'select' ? (
            <select
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            >
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            />
          )}
        </div>
      ))}
      <button onClick={handleSearch}>搜索</button>
    </div>
  );
}
```

## 使用示例

### 1. 基础搜索

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function UserSearch() {
  const handleSearchResult = (result: SearchResult<User>) => {
    console.log('搜索结果:', result);
  };

  return (
    <SearchBar<User>
      onSearchResult={handleSearchResult}
      placeholder="搜索用户..."
      debounceTime={500}
    />
  );
}
```

### 2. 高级搜索

```typescript
function UserAdvancedSearch() {
  const searchService = useSearchService<User>();

  const filters = [
    {
      field: 'name' as keyof User,
      label: '用户名',
      type: 'text',
    },
    {
      field: 'email' as keyof User,
      label: '邮箱',
      type: 'text',
    },
  ];

  const handleSearch = async (params: SearchParams) => {
    const result = await searchService.advancedSearch(params);
    console.log('高级搜索结果:', result);
  };

  return (
    <AdvancedSearch<User>
      onSearch={handleSearch}
      filters={filters}
    />
  );
}
```

## 最佳实践

1. **性能优化**
   - 实现搜索防抖
   - 缓存搜索结果
   - 优化请求策略

2. **用户体验**
   - 提供搜索建议
   - 显示加载状态
   - 支持快捷键操作

3. **可扩展性**
   - 支持自定义过滤器
   - 实现插件机制
   - 提供搜索钩子

4. **类型安全**
   - 使用泛型约束
   - 定义完整类型
   - 实现类型推导

5. **代码复用**
   - 抽象通用逻辑
   - 创建可复用组件
   - 实现搜索模板 