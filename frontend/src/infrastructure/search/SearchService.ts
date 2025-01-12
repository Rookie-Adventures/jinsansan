import { http } from '../http/HttpClient';

export interface SearchParams {
  keyword: string;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchService {
  search<T>(params: SearchParams): Promise<SearchResult<T>>;
  advancedSearch<T>(params: SearchParams): Promise<SearchResult<T>>;
}

export class SearchServiceImpl implements SearchService {
  async search<T>(params: SearchParams): Promise<SearchResult<T>> {
    const response = await http.get('/api/search', { params });
    return response.data;
  }

  async advancedSearch<T>(params: SearchParams): Promise<SearchResult<T>> {
    const response = await http.get('/api/search/advanced', { params });
    return response.data;
  }
} 