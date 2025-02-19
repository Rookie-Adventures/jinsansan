import debounce from 'lodash/debounce';
import { useCallback, useState, useRef, useEffect } from 'react';

import { Logger } from '../../infrastructure/logging/Logger';
import {
  SearchParams,
  SearchService,
  SearchServiceImpl,
} from '../../infrastructure/search/SearchService';
import { toError, toLogData } from '../../utils/error/errorUtils';

interface SearchBarProps<T> {
  onSearchResult: (result: T[]) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  debounceTime?: number;
}

export const SearchBar = <T,>({
  onSearchResult,
  onError,
  placeholder = '搜索...',
  debounceTime = 300,
}: SearchBarProps<T>): JSX.Element => {
  const [keyword, setKeyword] = useState('');
  const searchService = useRef<SearchService>(new SearchServiceImpl());
  const logger = useRef(Logger.getInstance());

  const search = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    try {
      const params: SearchParams = {
        keyword: searchKeyword,
        page: 1,
        pageSize: 10,
      };

      const searchResult = await searchService.current.search<T>(params);
      onSearchResult(searchResult.items);
    } catch (error) {
      logger.current.error('Search failed:', toLogData(error));
      onError?.(toError(error));
    }
  }, [onSearchResult, onError]);

  const debouncedSearch = useRef(
    debounce((value: string) => {
      search(value);
    }, debounceTime)
  );

  useEffect(() => {
    // 更新 debounce 时间
    debouncedSearch.current = debounce((value: string) => {
      search(value);
    }, debounceTime);
  }, [debounceTime, search]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeyword(value);
    debouncedSearch.current(value);
  };

  return (
    <div>
      <input type="text" value={keyword} onChange={handleInputChange} placeholder={placeholder} />
    </div>
  );
};
