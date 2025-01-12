import React, { useState, useCallback } from 'react';
import { SearchService, SearchServiceImpl, SearchParams } from '../../infrastructure/search/SearchService';
import debounce from 'lodash/debounce';

interface SearchBarProps<T> {
  onSearchResult: (result: T[]) => void;
  placeholder?: string;
  debounceTime?: number;
}

export function SearchBar<T>({
  onSearchResult,
  placeholder = '搜索...',
  debounceTime = 300
}: SearchBarProps<T>) {
  const [keyword, setKeyword] = useState('');
  const searchService: SearchService = new SearchServiceImpl();

  const debouncedSearch = useCallback(
    debounce(async (searchKeyword: string) => {
      if (!searchKeyword.trim()) return;

      try {
        const params: SearchParams = {
          keyword: searchKeyword,
          page: 1,
          pageSize: 10
        };

        const result = await searchService.search<T>(params);
        onSearchResult(result.items);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }, debounceTime),
    [onSearchResult]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
    </div>
  );
} 