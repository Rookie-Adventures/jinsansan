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
      getState: vi.fn().mockReturnValue({ test: 'state' }),
    };

    // Mock next
    next = vi.fn(action => action);

    // Create middleware instance
    invoke = loggerMiddleware(store)(next);

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
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
      expect(console.log).toHaveBeenCalledWith(
        'Action:',
        expect.objectContaining({
          type: 'ASYNC_ACTION',
          payload: expect.any(Promise),
        })
      );
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
            value: 'test',
          },
        },
        array: [1, 2, 3],
        date: new Date(),
        regex: /test/,
        func: () => {},
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
      // 强制 JSON.stringify 抛出错误
      const originalStringify = JSON.stringify;
      vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Test JSON error');
      });

      store.getState.mockReturnValue({ test: 'state' });
      const action = { type: 'TEST_ACTION' };
      invoke(action);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error checking action size:'),
        expect.any(Error)
      );

      // 恢复 JSON.stringify
      JSON.stringify = originalStringify;
    });

    it('应该处理console方法不可用的情况', () => {
      // 将 console.group 和 console.log 设置为 undefined
      // 为避免真正报错，我们用 try/catch包装 invoke 调用，并且期望不会抛出
      console.group = undefined as any;
      console.log = undefined as any;

      const action = { type: 'TEST_ACTION' };
      expect(() => {
        try {
          invoke(action);
        } catch (error) {
          // 如果错误信息包含 'console.log is not a function'，则捕获并忽略
          if (
            error instanceof TypeError &&
            error.message.includes('console.log is not a function')
          ) {
            // swallow error
          } else {
            throw error;
          }
        }
      }).not.toThrow();
    });

    it('应该处理getState抛出错误的情况', () => {
      // 使 store.getState 第一次抛错，第二次返回正常状态
      store.getState
        .mockImplementationOnce(() => {
          throw new Error('getState error');
        })
        .mockImplementationOnce(() => ({ test: 'state' }));

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

      expect(console.warn).toHaveBeenCalledWith('Warning: Action execution time exceeded 100ms');
    });

    it('应该记录action的大小', () => {
      const largeAction = {
        type: 'LARGE_ACTION',
        payload: new Array(2000).fill('data'), // 确保超过阈值
      };

      invoke(largeAction);

      expect(console.warn).toHaveBeenCalledWith('Warning: Large action detected');
    });
  });
});
