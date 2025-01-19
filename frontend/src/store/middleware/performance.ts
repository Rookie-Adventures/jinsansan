import Logger from '@/utils/logger';
import { Middleware } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';

export const performanceMiddleware: Middleware = () => (next) => (action) => {
  if (process.env.NODE_ENV !== 'production') {
    const startTime = performance.now();
    const result = next(action);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) { // 如果执行时间超过一帧(16ms)
      const actionType = (action as AnyAction).type || 'unknown';
      Logger.warn(`Action ${actionType} took ${duration.toFixed(2)}ms to complete`, {
        context: 'performanceMiddleware',
        data: { duration, actionType }
      });
    }

    return result;
  }
  return next(action);
}; 