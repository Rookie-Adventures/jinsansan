/* eslint-disable no-console */
import { Middleware } from 'redux';
import type { AnyAction } from 'redux';
import type { RootState } from '../types';

interface LoggerOptions {
  collapsed?: boolean;
  timestamp?: boolean;
  duration?: boolean;
  actionSize?: boolean;
  diff?: boolean;
}

const EXECUTION_TIME_THRESHOLD = 100; // ms
const ACTION_SIZE_THRESHOLD = 1000; // bytes

// 安全的日志记录函数
const safeLog = (method: keyof Console, ...args: any[]): void => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    (console[method] as any)?.(...args);
  } catch (error) {
    // 忽略日志错误
  }
};

// 检查性能
const checkPerformance = (
  executionTime: number,
  actionSize: number,
  actionType: string
): void => {
  if (executionTime > EXECUTION_TIME_THRESHOLD) {
    safeLog(
      'warn',
      `Warning: Action execution time exceeded ${EXECUTION_TIME_THRESHOLD}ms`
    );
  }

  if (actionSize > ACTION_SIZE_THRESHOLD) {
    safeLog(
      'warn',
      'Warning: Large action detected'
    );
  }
};

// 序列化状态
const serializeState = (state: any): any => {
  try {
    JSON.stringify(state);
    return state;
  } catch (error) {
    safeLog('error', 'Error logging state:', error);
    return '[Unserializable State]';
  }
};

export const loggerMiddleware: Middleware<{}, RootState> = 
  store => 
  next => 
  async (action: unknown) => {
    if (process.env.NODE_ENV === 'production') {
      return next(action);
    }

    const startTime = performance.now();
    let result;
    const typedAction = action as AnyAction;

    try {
      // 开始日志组
      safeLog('group', 'Action:', typedAction.type);

      // 记录前一个状态
      try {
        const prevState = store.getState();
        safeLog('log', 'Prev State:', serializeState(prevState));
      } catch (error) {
        safeLog('error', 'Error getting state:', error);
      }

      // 记录 action
      safeLog('log', 'Action:', typedAction);

      // 执行 action
      result = next(action);

      // 处理异步 action
      if (result instanceof Promise) {
        result = await result;
        // 记录解析后的异步 action
        safeLog('log', 'Action:', {
          ...typedAction,
          payload: await typedAction.payload
        });
      }

      // 记录下一个状态
      try {
        const nextState = store.getState();
        safeLog('log', 'Next State:', serializeState(nextState));
      } catch (error) {
        safeLog('error', 'Error getting state:', error);
      }

      // 性能监控
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const actionSize = new TextEncoder().encode(JSON.stringify(typedAction)).length;

      checkPerformance(executionTime, actionSize, typedAction.type);

      // 记录执行时间
      safeLog(
        'info',
        `Action execution time: ${executionTime.toFixed(2)}ms`
      );

    } catch (error) {
      if (error instanceof Error) {
        safeLog('error', 'Action Error:', error);
      } else {
        safeLog('error', 'Action Error:', new Error(String(error)));
      }
      throw error;
    } finally {
      safeLog('groupEnd');
    }

    return result;
  }; 