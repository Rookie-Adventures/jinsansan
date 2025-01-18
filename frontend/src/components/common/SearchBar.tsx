import debounce from 'lodash/debounce';
import React, { useCallback, useState } from 'react';
import { Logger } from '../../infrastructure/logging/Logger';
import { SearchParams, SearchService, SearchServiceImpl } from '../../infrastructure/search/SearchService';

interface SearchBarProps<T> {
  onSearchResult: (result: T[]) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  debounceTime?: number;
}

export function SearchBar<T>({
  onSearchResult,
  onError,
  placeholder = '搜索...',
  debounceTime = 300
}: SearchBarProps<T>) {
  const [keyword, setKeyword] = useState('');
  const searchService: SearchService = new SearchServiceImpl();
  const logger = Logger.getInstance();

  const debouncedSearch = useCallback(
    debounce(async (searchKeyword: string) => {
      if (!searchKeyword.trim()) return;

      try {
        const params: SearchParams = {
          keyword: searchKeyword,
          page: 1,
          pageSize: 10
        };

        const searchResult = await searchService.search<T>(params);
        onSearchResult(searchResult.items);
      } catch (error) {
        logger.error('Search failed:', error);
        onError?.(error as Error);
      }
    }, debounceTime),
    [onSearchResult, onError]
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