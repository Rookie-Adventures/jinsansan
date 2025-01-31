import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';

/**
 * 类型安全的dispatch hook
 * @returns {AppDispatch} 类型安全的dispatch函数
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
