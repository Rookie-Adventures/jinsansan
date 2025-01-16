import { Middleware } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV !== 'production') {
    const actionType = (action as AnyAction).type || 'unknown';
    console.group(actionType);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
}; 