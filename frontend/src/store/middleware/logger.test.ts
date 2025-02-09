import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loggerMiddleware } from './logger';

describe('loggerMiddleware', () => {
  let store: any;
  let next: ReturnType<typeof vi.fn>;
  let invoke: (action: any) => any;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalConsole = { ...console };

  beforeEach(() => {
    // Mock store
    store = {
      getState: vi.fn().mockReturnValue({ test: 'state' })
    };
    
    // Mock next
    next = vi.fn(action => action);
    
    // Create middleware instance
    invoke = loggerMiddleware(store)(next);

    // Mock console methods
    console.group = vi.fn();
    console.groupEnd = vi.fn();
    console.log = vi.fn();
    console.info = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    Object.assign(console, originalConsole);
  });

  describe('开发环境', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('应该记录action和state', () => {
      const action = { type: 'TEST_ACTION' };
      invoke(action);

      expect(console.group).toHaveBeenCalledWith('Action:', action.type);
      expect(console.log).toHaveBeenCalledWith('Prev State:', { test: 'state' });
      expect(console.log).toHaveBeenCalledWith('Action:', action);
      expect(console.log).toHaveBeenCalledWith('Next State:', { test: 'state' });
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('应该记录action执行时间', () => {
      const action = { type: 'TEST_ACTION' };
      invoke(action);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/Action execution time: \d+\.\d{2}ms/)
      );
    });

    it('应该处理异步action', async () => {
      const asyncAction = { type: 'ASYNC_ACTION', payload: Promise.resolve('data') };
      await invoke(asyncAction);

      expect(console.log).toHaveBeenCalledWith('Prev State:', { test: 'state' });
      expect(console.log).toHaveBeenCalledWith('Action:', expect.objectContaining({
        type: 'ASYNC_ACTION',
        payload: expect.any(Promise)
      }));
      expect(console.log).toHaveBeenCalledWith('Next State:', { test: 'state' });
    });

    it('应该处理错误action', async () => {
      const error = new Error('Test error');
      const errorAction = { type: 'ERROR_ACTION', error };
      next.mockRejectedValue(error);

      await expect(invoke(errorAction)).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('Action Error:', error);
    });

    it('应该处理复杂的state对象', () => {
      store.getState.mockReturnValue({
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3],
        date: new Date(),
        regex: /test/,
        func: () => {}
      });

      const action = { type: 'TEST_ACTION' };
      invoke(action);

      expect(console.log).toHaveBeenCalledWith('Prev State:', expect.any(Object));
      expect(console.log).toHaveBeenCalledWith('Next State:', expect.any(Object));
    });
  });

  describe('生产环境', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('不应该记录任何日志', () => {
      const action = { type: 'TEST_ACTION' };
      invoke(action);

      expect(console.group).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
    });

    it('应该正常传递action', async () => {
      const action = { type: 'TEST_ACTION' };
      next.mockResolvedValue(action);
      const result = await invoke(action);

      expect(result).toEqual(action);
      expect(next).toHaveBeenCalledWith(action);
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('应该处理序列化错误', () => {
      const circularObj: any = {};
      circularObj.self = circularObj;
      
      store.getState.mockReturnValue({ circular: circularObj });
      const action = { type: 'TEST_ACTION' };
      
      invoke(action);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error logging state:'),
        expect.any(Error)
      );
    });

    it('应该处理console方法不可用的情况', () => {
      console.group = undefined as any;
      console.log = undefined as any;
      
      const action = { type: 'TEST_ACTION' };
      expect(() => invoke(action)).not.toThrow();
    });

    it('应该处理getState抛出错误的情况', () => {
      store.getState.mockImplementation(() => {
        throw new Error('getState error');
      });

      const action = { type: 'TEST_ACTION' };
      expect(() => invoke(action)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting state:'),
        expect.any(Error)
      );
    });
  });

  describe('性能监控', () => {
    let now: number;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      now = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        now += 150; // 每次调用增加150ms
        return now;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('应该警告执行时间过长的action', async () => {
      const action = { type: 'SLOW_ACTION' };
      next.mockResolvedValue(action);

      await invoke(action);

      expect(console.warn).toHaveBeenCalledWith(
        'Warning: Action execution time exceeded 100ms'
      );
    });

    it('应该记录action的大小', () => {
      const largeAction = {
        type: 'LARGE_ACTION',
        payload: new Array(2000).fill('data') // 确保超过阈值
      };

      invoke(largeAction);

      expect(console.warn).toHaveBeenCalledWith(
        'Warning: Large action detected'
      );
    });
  });
}); 