import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Logger from '@/utils/logger';

import { performanceMiddleware } from '../performance';

vi.mock('@/utils/logger');

describe('performanceMiddleware', () => {
  let next: ReturnType<typeof vi.fn>;
  let invoke: (action: any) => any;
  const originalEnv = process.env.NODE_ENV;
  const originalPerformance = global.performance;

  beforeEach(() => {
    next = vi.fn();
    const api = {
      getState: vi.fn(),
      dispatch: vi.fn(),
    };
    invoke = performanceMiddleware(api)(next);
    vi.clearAllMocks();

    // Mock performance.now()
    const mockPerformanceNow = vi.fn(() => 0);
    global.performance = {
      ...originalPerformance,
      now: mockPerformanceNow,
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.performance = originalPerformance;
  });

  it('在生产环境中应该直接传递 action', () => {
    process.env.NODE_ENV = 'production';
    const action = { type: 'test' };

    invoke(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it('在开发环境中应该记录耗时超过16ms的 action', () => {
    process.env.NODE_ENV = 'development';
    const action = { type: 'test/slowAction' };

    // Mock performance.now to simulate slow action
    let callCount = 0;
    (global.performance.now as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return callCount++ === 0 ? 0 : 20; // 返回 0 和 20 来模拟 20ms 的执行时间
    });

    invoke(action);

    expect(Logger.warn).toHaveBeenCalledWith(
      'Action test/slowAction took 20.00ms to complete',
      expect.objectContaining({
        context: 'performanceMiddleware',
        data: expect.objectContaining({
          duration: 20,
          actionType: 'test/slowAction',
        }),
      })
    );
  });

  it('在开发环境中不应该记录耗时小于16ms的 action', () => {
    process.env.NODE_ENV = 'development';
    const action = { type: 'test/fastAction' };

    // Mock performance.now to simulate fast action
    let callCount = 0;
    (global.performance.now as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return callCount++ === 0 ? 0 : 10; // 返回 0 和 10 来模拟 10ms 的执行时间
    });

    invoke(action);

    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it('应该处理没有 type 的 action', () => {
    process.env.NODE_ENV = 'development';
    const action = {};

    let callCount = 0;
    (global.performance.now as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return callCount++ === 0 ? 0 : 20;
    });

    invoke(action);

    expect(Logger.warn).toHaveBeenCalledWith(
      'Action unknown took 20.00ms to complete',
      expect.any(Object)
    );
  });
});
