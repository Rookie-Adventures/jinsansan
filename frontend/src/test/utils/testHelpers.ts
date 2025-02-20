import { type Mock, vi } from 'vitest';

type MockFn<T> = Mock<[], Promise<T>>;

/**
 * 创建模拟的请求函数
 * @param result 请求结果
 * @param delay 延迟时间（毫秒）
 */
export const createMockRequest = <T>(result: T, delay = 0): MockFn<T> => {
  return vi.fn().mockImplementation(
    () =>
      new Promise<T>((resolve) => {
        setTimeout(() => {
          resolve(result);
        }, delay);
      })
  );
};

/**
 * 创建模拟的错误请求函数
 * @param error 错误对象
 * @param delay 延迟时间（毫秒）
 */
export const createMockErrorRequest = (error: Error, delay = 0): MockFn<never> => {
  return vi.fn().mockImplementation(
    () =>
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => {
          reject(error);
        }, delay);
      })
  );
};

/**
 * 等待指定时间
 * @param ms 等待时间（毫秒）
 */
export const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 创建测试错误
 * @param message 错误消息
 * @param code 错误代码
 */
export const createTestError = (message: string, code?: string): Error => {
  const error = new Error(message);
  if (code) {
    Object.assign(error, { code });
  }
  return error;
};

/**
 * 模拟定时器和动画
 * @param callback 回调函数
 * @param animationDuration 动画持续时间
 */
export const runTimersAndAnimation = async (
  callback: () => void, 
  animationDuration = 225
): Promise<void> => {
  callback();
  vi.advanceTimersByTime(animationDuration);
  vi.runAllTimers();
}; 