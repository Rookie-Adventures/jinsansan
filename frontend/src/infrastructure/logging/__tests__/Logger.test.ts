import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../Logger';
import { LogData } from '../types';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    log: any;
    error: any;
    warn: any;
    info: any;
  };

  beforeEach(() => {
    // 清除之前的 mock
    vi.clearAllMocks();

    // Mock console 方法
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    };

    // 初始化 Logger
    logger = Logger.getInstance();
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('日志级别', () => {
    it('应该正确记录 info 日志', () => {
      const message = 'Test info message';
      const data = { key: 'value' };
      
      logger.info(message, data);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        message,
        data
      );
    });

    it('应该正确记录 error 日志', () => {
      const message = 'Test error message';
      const errorData: LogData = {
        error: new Error('Test error'),
        stack: new Error('Test error').stack,
        code: 'ERR_TEST'
      };
      
      logger.error(message, errorData);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        message,
        errorData
      );
    });

    it('应该正确记录 warn 日志', () => {
      const message = 'Test warning message';
      const data = { key: 'value' };
      
      logger.warn(message, data);
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        message,
        data
      );
    });

    it('应该正确记录 debug 日志', () => {
      const message = 'Test debug message';
      const data = { key: 'value' };
      
      logger.debug(message, data);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        message,
        data
      );
    });
  });

  describe('格式化', () => {
    it('应该包含时间戳', () => {
      const message = 'Test message';
      
      logger.info(message);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \[INFO\]/),
        message,
        undefined
      );
    });

    it('应该正确处理对象数据', () => {
      const message = 'Test message';
      const complexData: LogData = {
        nested: {
          array: [1, 2, 3],
          null: null,
          undefined: undefined,
        },
      };
      
      logger.info(message, complexData);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        message,
        complexData
      );
    });

    it('应该处理循环引用对象', () => {
      const message = 'Test message';
      const circularObj: LogData = { key: 'value' };
      (circularObj as any).self = circularObj;
      
      logger.info(message, circularObj);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        message,
        circularObj
      );
    });
  });

  describe('错误处理', () => {
    it('应该处理 undefined 消息', () => {
      logger.info(undefined as any);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'undefined',
        undefined
      );
    });

    it('应该处理 null 消息', () => {
      logger.info(null as any);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'null',
        undefined
      );
    });

    it('应该处理非字符串消息', () => {
      const message = { toString: () => 'object message' };
      
      logger.info(message as any);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'object message',
        message
      );
    });
  });
}); 