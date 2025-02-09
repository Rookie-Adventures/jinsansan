import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorMiddleware } from '../error';
import Logger from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn()
  }
}));
vi.mock('../../slices/appSlice', () => ({
  showToast: vi.fn((payload) => ({ type: 'app/showToast', payload }))
}));

describe('errorMiddleware', () => {
  let store: any;
  let next: ReturnType<typeof vi.fn>;
  let invoke: (action: any) => any;

  beforeEach(() => {
    store = {
      dispatch: vi.fn()
    };
    next = vi.fn();
    invoke = errorMiddleware(store)(next);
    vi.clearAllMocks();
  });

  it('应该处理错误 action', () => {
    const errorAction = {
      type: 'test/rejected',
      error: { message: '测试错误' }
    };

    invoke(errorAction);

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          message: '测试错误',
          severity: 'error'
        }
      })
    );
    expect(next).toHaveBeenCalledWith(errorAction);
  });

  it('应该处理没有错误消息的错误 action', () => {
    const errorAction = {
      type: 'test/rejected',
      error: {}
    };

    invoke(errorAction);

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          message: '操作失败，请稍后重试',
          severity: 'error'
        }
      })
    );
  });

  it('应该处理非错误 action', () => {
    const normalAction = {
      type: 'test/success',
      payload: 'data'
    };

    invoke(normalAction);

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(normalAction);
  });

  it('应该处理中间件内部错误', () => {
    const action = {
      type: 'test/action',
      payload: null
    };
    next.mockImplementation(() => {
      throw new Error('内部错误');
    });

    invoke(action);

    expect(Logger.error).toHaveBeenCalledWith(
      'Action Error:',
      expect.objectContaining({
        context: 'errorMiddleware'
      })
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          message: '系统错误，请稍后重试',
          severity: 'error'
        }
      })
    );
  });
}); 