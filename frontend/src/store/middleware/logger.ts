/* eslint-disable no-console */
import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { RootState } from '../types';

const EXECUTION_TIME_THRESHOLD = 100; // ms
const ACTION_SIZE_THRESHOLD = 1000; // bytes

interface ExecutionTimeLogOptions {
  startTime: number;
  threshold: number;
  actionType: string;
}

/**
 * 记录执行时间并在超过阈值时发出警告
 */
const logExecutionTime = ({ startTime, threshold, actionType }: ExecutionTimeLogOptions): void => {
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (duration > threshold) {
    console.warn(`Warning: Action ${actionType} execution time exceeded ${threshold}ms`);
  }

  console.info(`Action ${actionType} execution time: ${duration.toFixed(2)}ms`);
};

/**
 * 检查 action 大小
 */
const checkActionSize = (action: AnyAction, threshold: number): void => {
  try {
    const size = new TextEncoder().encode(JSON.stringify(action)).length;
    if (size > threshold) {
      console.warn(`Warning: Large action detected (${size} bytes)`);
    }
  } catch (error) {
    console.error('Error checking action size:', error);
  }
};

/**
 * 安全地记录状态
 */
const logState = <S extends RootState>(label: string, getState: () => S): void => {
  try {
    const state = getState();
    console.log(`${label}:`, state);
  } catch (error) {
    console.error(`Error logging ${label.toLowerCase()} state:`, error);
  }
};

/**
 * 安全地执行控制台分组操作
 */
const safeConsoleGroup = (action: AnyAction, isEnd = false): void => {
  try {
    if (isEnd) {
      console.groupEnd();
    } else {
      console.group('Action:', action.type);
    }
  } catch {
    // Ignore group errors
  }
};

export const loggerMiddleware = <S extends RootState = RootState, A extends AnyAction = AnyAction>(
  api: MiddlewareAPI<Dispatch<A>, S>
) => (next: Dispatch<A>) => (action: A) => {
  if (process.env.NODE_ENV === 'production') {
    return next(action);
  }

  const startTime = performance.now();
  let result;

  try {
    checkActionSize(action, ACTION_SIZE_THRESHOLD);
    safeConsoleGroup(action);
    
    logState('Prev State', api.getState);
    console.log('Action:', action);

    try {
      result = next(action);

      // 处理异步 action
      if (result instanceof Promise) {
        return result.then(
          value => {
            logState('Next State', api.getState);
            safeConsoleGroup(action, true);
            
            logExecutionTime({
              startTime,
              threshold: EXECUTION_TIME_THRESHOLD,
              actionType: action.type,
            });

            return value;
          },
          error => {
            console.error('Action Error:', error);
            safeConsoleGroup(action, true);
            throw error;
          }
        );
      }

      // 处理同步 action
      logState('Next State', api.getState);
      safeConsoleGroup(action, true);
      
      logExecutionTime({
        startTime,
        threshold: EXECUTION_TIME_THRESHOLD,
        actionType: action.type,
      });

      return result;
    } catch (error) {
      console.error('Action Error:', error);
      safeConsoleGroup(action, true);
      throw error;
    }
  } catch (error) {
    console.error('Logger Middleware Error:', error);
    throw error;
  }
};
