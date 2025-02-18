import { Middleware } from '@reduxjs/toolkit';

import Logger from '@/utils/logger';

import { showToast } from '../slices/appSlice';
import { isErrorAction } from '../types/actions';

export const errorMiddleware: Middleware = store => next => action => {
  try {
    if (isErrorAction(action)) {
      // 处理 rejected action
      const errorMessage = action.error.message || '操作失败，请稍后重试';
      store.dispatch(
        showToast({
          message: errorMessage,
          severity: 'error',
        })
      );
    }
    return next(action);
  } catch (err) {
    Logger.error('Action Error:', { context: 'errorMiddleware', data: err });
    store.dispatch(
      showToast({
        message: '系统错误，请稍后重试',
        severity: 'error',
      })
    );
    return err;
  }
};
