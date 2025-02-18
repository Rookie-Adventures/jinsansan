import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { toError, getErrorMessage, toLogData } from '../errorUtils';

describe('errorUtils', () => {
  beforeEach(() => {
    // 固定时间戳
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-07T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('toError', () => {
    it('应该保持 Error 对象不变', () => {
      const error = new Error('测试错误');
      expect(toError(error)).toBe(error);
    });

    it('应该将字符串转换为 Error 对象', () => {
      const result = toError('测试错误');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('测试错误');
    });

    it('应该将数字转换为 Error 对象', () => {
      const result = toError(404);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('404');
    });

    it('应该将对象转换为 Error 对象', () => {
      const obj = { message: '测试错误' };
      const result = toError(obj);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('[object Object]');
    });

    it('应该将 null 转换为 Error 对象', () => {
      const result = toError(null);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('null');
    });

    it('应该将 undefined 转换为 Error 对象', () => {
      const result = toError(undefined);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('undefined');
    });
  });

  describe('getErrorMessage', () => {
    it('应该从 Error 对象获取消息', () => {
      const error = new Error('测试错误');
      expect(getErrorMessage(error)).toBe('测试错误');
    });

    it('应该将字符串作为消息返回', () => {
      expect(getErrorMessage('测试错误')).toBe('测试错误');
    });

    it('应该将数字转换为字符串', () => {
      expect(getErrorMessage(404)).toBe('404');
    });

    it('应该将对象转换为字符串', () => {
      const obj = { message: '测试错误' };
      expect(getErrorMessage(obj)).toBe('[object Object]');
    });

    it('应该处理 null', () => {
      expect(getErrorMessage(null)).toBe('null');
    });

    it('应该处理 undefined', () => {
      expect(getErrorMessage(undefined)).toBe('undefined');
    });
  });

  describe('toLogData', () => {
    it('应该将非 Error 对象转换为日志数据', () => {
      const result = toLogData('测试错误');

      expect(result).toMatchObject({
        error: '测试错误',
        timestamp: 1707264000000,
      });
      // 不比较具体的 stack trace，只验证其存在性
      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });

    it('应该处理 null', () => {
      const result = toLogData(null);

      expect(result).toMatchObject({
        error: 'null',
        timestamp: 1707264000000,
      });
      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });

    it('应该处理 undefined', () => {
      const result = toLogData(undefined);

      expect(result).toMatchObject({
        error: 'undefined',
        timestamp: 1707264000000,
      });
      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });
  });
});
