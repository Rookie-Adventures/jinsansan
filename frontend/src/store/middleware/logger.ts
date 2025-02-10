/* eslint-disable no-console */
import { Middleware, Action } from 'redux';

const EXECUTION_TIME_THRESHOLD = 100; // ms
const ACTION_SIZE_THRESHOLD = 1000; // bytes

export const loggerMiddleware: Middleware = store => next => action => {
  if (process.env.NODE_ENV === 'production') {
    return next(action);
  }

  const startTime = performance.now();
  let result;

  try {
    // Check action size
    try {
      const size = new TextEncoder().encode(JSON.stringify(action)).length;
      if (size > ACTION_SIZE_THRESHOLD) {
        console.warn('Warning: Large action detected');
      }
    } catch (error) {
      console.error('Error checking action size:', error);
    }

    try {
      console.group('Action:', (action as Action).type);
    } catch {
      // Ignore group errors
    }

    let prevState;
    try {
      prevState = store.getState();
      console.log('Prev State:', prevState);
    } catch (error) {
      console.error('Error getting state:', error);
    }

    console.log('Action:', action);

    try {
      result = next(action);

      // 如果是 Promise，等待它完成
      if (result instanceof Promise) {
        return result.then(
          value => {
            try {
              const nextState = store.getState();
              console.log('Next State:', nextState);
              console.groupEnd();

              const endTime = performance.now();
              const duration = endTime - startTime;

              if (duration > EXECUTION_TIME_THRESHOLD) {
                console.warn(
                  `Warning: Action execution time exceeded ${EXECUTION_TIME_THRESHOLD}ms`
                );
              }

              console.info(`Action execution time: ${duration.toFixed(2)}ms`);

              return value;
            } catch (error) {
              console.error('Error logging state:', error);
              return value;
            }
          },
          error => {
            console.error('Action Error:', error);
            throw error;
          }
        );
      }

      // 同步结果
      const nextState = store.getState();
      console.log('Next State:', nextState);
    } catch (error) {
      console.error('Action Error:', error);
      throw error;
    }

    try {
      console.groupEnd();
    } catch {
      // Ignore group errors
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > EXECUTION_TIME_THRESHOLD) {
      console.warn(`Warning: Action execution time exceeded ${EXECUTION_TIME_THRESHOLD}ms`);
    }

    console.info(`Action execution time: ${duration.toFixed(2)}ms`);

    return result;
  } catch (error) {
    console.error('Action Error:', error);
    throw error;
  }
};
