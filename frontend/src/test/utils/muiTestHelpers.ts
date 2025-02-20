import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * 等待 MUI 组件动画完成
 * 默认动画时长为 225ms
 */
export const waitForAnimation = async (duration = 225): Promise<void> => {
  // 使用假定时器避免实际等待
  vi.useFakeTimers();
  await act(async () => {
    vi.advanceTimersByTime(duration);
    // 等待一个微任务周期，确保所有状态更新完成
    await Promise.resolve();
  });
  vi.useRealTimers();
};

/**
 * 等待组件更新和动画完成
 * @param callback 要执行的回调函数
 * @param animationDuration 动画持续时间（毫秒）
 */
export const runWithAct = async (
  callback: () => void | Promise<void>,
  animationDuration = 225
): Promise<void> => {
  await act(async () => {
    await callback();
    // 等待一个微任务周期
    await Promise.resolve();
  });
  await waitForAnimation(animationDuration);
};

/**
 * 模拟点击事件并等待动画完成
 * @param element 要点击的元素
 * @param animationDuration 动画持续时间（毫秒）
 */
export const clickAndWait = async (
  element: HTMLElement | null | undefined,
  animationDuration = 225
): Promise<void> => {
  if (!element) {
    throw new Error('Element not found');
  }
  
  await runWithAct(() => {
    element.click();
  }, animationDuration);
};

/**
 * 等待所有挂起的定时器和动画
 */
export const waitForAll = async (): Promise<void> => {
  vi.useFakeTimers();
  await act(async () => {
    vi.runAllTimers();
    await Promise.resolve();
  });
  vi.useRealTimers();
}; 