import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toError, getErrorMessage, toLogData } from '../errorUtils';

describe('errorUtils', () => {
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
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-02-07'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该将 Error 对象转换为日志数据', () => {
      const error = new Error('测试错误');
      const result = toLogData(error);
      
      expect(result).toEqual({
        error: '测试错误',
        stack: error.stack,
        timestamp: Date.now()
      });
    });

    it('应该将非 Error 对象转换为日志数据', () => {
      const result = toLogData('测试错误');
      
      expect(result).toEqual({
        error: '测试错误',
        stack: undefined,
        timestamp: Date.now()
      });
    });

    it('应该处理 null', () => {
      const result = toLogData(null);
      
      expect(result).toEqual({
        error: 'null',
        stack: undefined,
        timestamp: Date.now()
      });
    });

    it('应该处理 undefined', () => {
      const result = toLogData(undefined);
      
      expect(result).toEqual({
        error: 'undefined',
        stack: undefined,
        timestamp: Date.now()
      });
    });
  });
}); 